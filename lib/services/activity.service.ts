import { db } from "@/lib/db/client";
import type { ActivityAction, PrismaClient, Prisma } from "@prisma/client";

type ActivityParams = {
  orderId?: string;
  userId?: string;
  action: ActivityAction;
  metadata?: Record<string, unknown>;
};

export async function logActivity(
  params: ActivityParams,
  tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
) {
  const client = tx ?? db;
  return client.activityLog.create({
    data: {
      orderId: params.orderId,
      userId: params.userId,
      action: params.action,
      metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function getActivityLogs(options?: {
  orderId?: string;
  limit?: number;
  offset?: number;
}) {
  return db.activityLog.findMany({
    where: options?.orderId ? { orderId: options.orderId } : undefined,
    include: {
      order: {
        select: { externalOrderNumber: true },
      },
      user: {
        select: { displayName: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 100,
    skip: options?.offset ?? 0,
  });
}
