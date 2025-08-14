import { db } from "@/lib/db/client";
import { logActivity } from "@/lib/services/activity.service";

export async function assignOrder(params: {
  orderId: string;
  userId: string;
  assignedByUserId: string;
}) {
  const { orderId, userId, assignedByUserId } = params;

  const existing = await db.assignment.findUnique({
    where: { orderId },
    include: { user: { select: { displayName: true } } },
  });

  const isReassign = existing && !existing.unassignedAt;

  await db.$transaction(async (tx) => {
    if (isReassign) {
      await tx.assignment.update({
        where: { orderId },
        data: {
          userId,
          assignedById: assignedByUserId,
          assignedAt: new Date(),
          unassignedAt: null,
        },
      });

      await logActivity(
        {
          orderId,
          userId: assignedByUserId,
          action: "ORDER_REASSIGNED",
          metadata: {
            fromUserId: existing.userId,
            fromUserName: existing.user.displayName,
            toUserId: userId,
          },
        },
        tx
      );
    } else {
      if (existing) {
        await tx.assignment.update({
          where: { orderId },
          data: { userId, assignedById: assignedByUserId, assignedAt: new Date(), unassignedAt: null },
        });
      } else {
        await tx.assignment.create({
          data: { orderId, userId, assignedById: assignedByUserId },
        });
      }

      await logActivity(
        {
          orderId,
          userId: assignedByUserId,
          action: "ORDER_ASSIGNED",
          metadata: { toUserId: userId },
        },
        tx
      );
    }

    // Update order internal status to ASSIGNED if it was UNASSIGNED
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { internalStatus: true },
    });

    if (order?.internalStatus === "UNASSIGNED") {
      await tx.order.update({
        where: { id: orderId },
        data: { internalStatus: "ASSIGNED" },
      });
    }
  });
}

export async function unassignOrder(params: {
  orderId: string;
  actorUserId: string;
}) {
  const { orderId, actorUserId } = params;

  await db.$transaction(async (tx) => {
    await tx.assignment.updateMany({
      where: { orderId, unassignedAt: null },
      data: { unassignedAt: new Date() },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { internalStatus: "UNASSIGNED" },
    });

    await logActivity(
      {
        orderId,
        userId: actorUserId,
        action: "ORDER_UNASSIGNED",
        metadata: {},
      },
      tx
    );
  });
}

export async function getAssignedOrdersForUser(userId: string) {
  return db.order.findMany({
    where: {
      assignment: {
        userId,
        unassignedAt: null,
      },
      internalStatus: {
        notIn: ["COMPLETED"],
      },
    },
    include: {
      items: true,
      assignment: {
        include: {
          user: { select: { displayName: true } },
        },
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
}
