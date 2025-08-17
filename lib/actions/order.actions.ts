"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  syncOrdersFromShopify,
  syncOrderFromShopify,
  updateOrderStatus,
  updateOrderNotes,
} from "@/lib/services/order.service";
import {
  updateOrderStatusSchema,
  updateOrderNotesSchema,
} from "@/lib/validations/order.schema";

export async function syncOrdersAction(limit?: number) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await syncOrdersFromShopify({
      limit: limit ?? 50,
      actorUserId: session.userId,
    });

    revalidatePath("/admin");
    revalidatePath("/staff");

    return { success: true, ...result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Sync failed",
    };
  }
}

export async function syncSingleOrderAction(shopifyId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const result = await syncOrderFromShopify(shopifyId, session.userId);
  revalidatePath("/admin");
  return result;
}

export async function updateOrderStatusAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = updateOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  try {
    await updateOrderStatus(
      parsed.data.orderId,
      parsed.data.status,
      session.userId
    );

    revalidatePath(`/orders/${parsed.data.orderId}`);
    revalidatePath("/admin");
    revalidatePath("/staff");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Update failed",
    };
  }
}

export async function updateOrderNotesAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = updateOrderNotesSchema.safeParse({
    orderId: formData.get("orderId"),
    fulfillmentNotes: formData.get("fulfillmentNotes") ?? undefined,
    deliveryNotes: formData.get("deliveryNotes") ?? undefined,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  try {
    await updateOrderNotes(parsed.data.orderId, {
      fulfillmentNotes: parsed.data.fulfillmentNotes,
      deliveryNotes: parsed.data.deliveryNotes,
    });

    revalidatePath(`/orders/${parsed.data.orderId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Update failed",
    };
  }
}
