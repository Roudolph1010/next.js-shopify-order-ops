import { db } from "@/lib/db/client";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_ORDER_QUERY, GET_ORDERS_QUERY } from "@/lib/shopify/queries";
import { mapShopifyOrder } from "@/lib/shopify/mappers";
import { logActivity } from "@/lib/services/activity.service";
import type {
  ShopifyOrderResponse,
  ShopifyOrdersResponse,
} from "@/lib/shopify/types";
import type { InternalStatus, Priority, Prisma } from "@prisma/client";

export type OrderFilters = {
  status?: InternalStatus;
  assignedUserId?: string;
  search?: string;
  priority?: Priority;
  limit?: number;
  cursor?: string;
};

export async function getOrders(filters: OrderFilters = {}) {
  const where: Prisma.OrderWhereInput = {};

  if (filters.status) {
    where.internalStatus = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.assignedUserId) {
    where.assignment = {
      userId: filters.assignedUserId,
      unassignedAt: null,
    };
  }

  if (filters.search) {
    where.OR = [
      { externalOrderNumber: { contains: filters.search, mode: "insensitive" } },
      { customerName: { contains: filters.search, mode: "insensitive" } },
      { customerEmail: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return db.order.findMany({
    where,
    include: {
      items: true,
      assignment: {
        where: { unassignedAt: null },
        include: {
          user: { select: { id: true, displayName: true, username: true } },
        },
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: filters.limit ?? 50,
    ...(filters.cursor ? { skip: 1, cursor: { id: filters.cursor } } : {}),
  });
}

export async function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: true,
      assignment: {
        include: {
          user: { select: { id: true, displayName: true, username: true } },
        },
      },
      notes: {
        include: {
          user: { select: { displayName: true, username: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      activityLogs: {
        include: {
          user: { select: { displayName: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
}

export async function syncOrderFromShopify(
  shopifyId: string,
  actorUserId?: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const data = await shopifyFetch<ShopifyOrderResponse>(GET_ORDER_QUERY, {
      id: shopifyId,
    });

    if (!data.order) {
      return { success: false, error: "Order not found in Shopify" };
    }

    const mapped = mapShopifyOrder(data.order);

    const order = await db.$transaction(async (tx) => {
      const upserted = await tx.order.upsert({
        where: { externalId: mapped.externalId },
        update: {
          externalOrderNumber: mapped.externalOrderNumber,
          customerName: mapped.customerName,
          customerEmail: mapped.customerEmail,
          shippingMethod: mapped.shippingMethod,
          shippingAddress: mapped.shippingAddress,
          externalStatus: mapped.externalStatus,
          tags: mapped.tags,
          shopifyUpdatedAt: mapped.shopifyUpdatedAt,
          rawPayload: mapped.rawPayload as unknown as Prisma.InputJsonValue,
          lastSyncedAt: new Date(),
        },
        create: {
          externalId: mapped.externalId,
          externalOrderNumber: mapped.externalOrderNumber,
          customerName: mapped.customerName,
          customerEmail: mapped.customerEmail,
          shippingMethod: mapped.shippingMethod,
          shippingAddress: mapped.shippingAddress,
          externalStatus: mapped.externalStatus,
          tags: mapped.tags,
          shopifyCreatedAt: mapped.shopifyCreatedAt,
          shopifyUpdatedAt: mapped.shopifyUpdatedAt,
          rawPayload: mapped.rawPayload as unknown as Prisma.InputJsonValue,
          lastSyncedAt: new Date(),
        },
      });

      // Sync line items: delete old, insert new
      await tx.orderItem.deleteMany({ where: { orderId: upserted.id } });
      if (mapped.items.length > 0) {
        await tx.orderItem.createMany({
          data: mapped.items.map((item) => ({
            orderId: upserted.id,
            externalId: item.externalId,
            title: item.title,
            variantTitle: item.variantTitle,
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl,
          })),
        });
      }

      await logActivity(
        {
          orderId: upserted.id,
          userId: actorUserId,
          action: "ORDER_SYNCED",
          metadata: {
            shopifyId: mapped.externalId,
            orderNumber: mapped.externalOrderNumber,
          },
        },
        tx
      );

      return upserted;
    });

    return { success: true, orderId: order.id };
  } catch (err) {
    console.error("[OrderSync] Failed to sync order:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function syncOrdersFromShopify(options: {
  query?: string;
  limit?: number;
  actorUserId?: string;
}): Promise<{ synced: number; errors: number }> {
  let synced = 0;
  let errors = 0;
  let cursor: string | undefined;
  const pageSize = Math.min(options.limit ?? 50, 250);

  do {
    const data = await shopifyFetch<ShopifyOrdersResponse>(GET_ORDERS_QUERY, {
      first: pageSize,
      after: cursor ?? null,
      query: options.query ?? null,
    });

    const { nodes, pageInfo } = data.orders;

    for (const shopifyOrder of nodes) {
      const result = await syncOrderFromShopify(
        shopifyOrder.id,
        options.actorUserId
      );
      if (result.success) {
        synced++;
      } else {
        errors++;
      }
    }

    cursor = pageInfo.hasNextPage ? pageInfo.endCursor : undefined;

    if (!pageInfo.hasNextPage) break;
    if (options.limit && synced >= options.limit) break;
  } while (cursor);

  return { synced, errors };
}

export async function updateOrderStatus(
  orderId: string,
  status: InternalStatus,
  actorUserId: string
) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  const previousStatus = order.internalStatus;

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { internalStatus: status },
    });

    await logActivity(
      {
        orderId,
        userId: actorUserId,
        action: "STATUS_UPDATED",
        metadata: { from: previousStatus, to: status },
      },
      tx
    );
  });
}

export async function updateOrderNotes(
  orderId: string,
  data: { fulfillmentNotes?: string; deliveryNotes?: string }
) {
  return db.order.update({
    where: { id: orderId },
    data: {
      fulfillmentNotes: data.fulfillmentNotes,
      deliveryNotes: data.deliveryNotes,
    },
  });
}

export async function getOrderCounts() {
  const [unassigned, assigned, inProgress, packed, completed] =
    await Promise.all([
      db.order.count({ where: { internalStatus: "UNASSIGNED" } }),
      db.order.count({ where: { internalStatus: "ASSIGNED" } }),
      db.order.count({ where: { internalStatus: "IN_PROGRESS" } }),
      db.order.count({ where: { internalStatus: "PACKED" } }),
      db.order.count({ where: { internalStatus: "COMPLETED" } }),
    ]);

  return { unassigned, assigned, inProgress, packed, completed };
}
