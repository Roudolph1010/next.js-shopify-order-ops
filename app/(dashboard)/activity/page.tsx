import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getActivityLogs } from "@/lib/services/activity.service";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import type { ActivityAction, Role } from "@prisma/client";

export default async function ActivityPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const logs = await getActivityLogs({ limit: 200 });

  return (
    <div className="max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold">Activity Log</h2>
      <ActivityFeed
        logs={logs.map((log) => ({
          ...log,
          action: log.action as ActivityAction,
          metadata: (log.metadata as Record<string, unknown>) ?? {},
          createdAt: new Date(log.createdAt),
          user: log.user
            ? { displayName: log.user.displayName, role: log.user.role as Role }
            : null,
          order: log.order ? { externalOrderNumber: log.order.externalOrderNumber } : null,
        }))}
      />
    </div>
  );
}
