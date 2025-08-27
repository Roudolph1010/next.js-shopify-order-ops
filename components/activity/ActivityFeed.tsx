import { formatDistanceToNow } from "date-fns";
import type { ActivityAction, Role } from "@prisma/client";

const actionLabels: Record<ActivityAction, string> = {
  ORDER_SYNCED: "Order synced from Shopify",
  ORDER_ASSIGNED: "Order assigned",
  ORDER_UNASSIGNED: "Assignment removed",
  ORDER_REASSIGNED: "Order reassigned",
  STATUS_UPDATED: "Status updated",
  NOTE_ADDED: "Note added",
  NOTE_DELETED: "Note deleted",
  WEBHOOK_RECEIVED: "Webhook received",
};

interface LogEntry {
  id: string;
  action: ActivityAction;
  metadata: Record<string, unknown>;
  createdAt: Date;
  order?: { externalOrderNumber: string } | null;
  user: { displayName: string; role: Role } | null;
}

function renderMetadata(action: ActivityAction, metadata: Record<string, unknown>): string | null {
  switch (action) {
    case "STATUS_UPDATED":
      return `${metadata.from} → ${metadata.to}`;
    case "ORDER_ASSIGNED":
      return metadata.toUserName ? `to ${metadata.toUserName}` : null;
    case "ORDER_REASSIGNED":
      return metadata.fromUserName && metadata.toUserName
        ? `from ${metadata.fromUserName} to ${metadata.toUserName}`
        : null;
    case "WEBHOOK_RECEIVED":
      return metadata.topic ? `topic: ${metadata.topic}` : null;
    default:
      return null;
  }
}

export function ActivityFeed({ logs }: { logs: LogEntry[] }) {
  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border rounded-lg">
        No activity recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-0 rounded-lg border divide-y">
      {logs.map((log) => {
        const detail = renderMetadata(log.action, log.metadata);
        return (
          <div key={log.id} className="flex items-start gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium">{actionLabels[log.action]}</span>
                {log.order && (
                  <span className="text-sm text-muted-foreground">
                    {log.order.externalOrderNumber}
                  </span>
                )}
                {detail && (
                  <span className="text-sm text-muted-foreground">— {detail}</span>
                )}
              </div>
              {log.user && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  by {log.user.displayName} ({log.user.role})
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
