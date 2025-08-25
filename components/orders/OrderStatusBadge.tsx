import { Badge } from "@/components/ui/badge";
import type { InternalStatus, Priority } from "@prisma/client";

const statusConfig: Record<
  InternalStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  UNASSIGNED: { label: "Unassigned", variant: "outline" },
  ASSIGNED: { label: "Assigned", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  PACKED: { label: "Packed", variant: "default" },
  COMPLETED: { label: "Completed", variant: "secondary" },
};

const priorityConfig: Record<
  Priority,
  { label: string; className: string }
> = {
  LOW: { label: "Low", className: "bg-slate-100 text-slate-600 border-slate-200" },
  NORMAL: { label: "Normal", className: "bg-blue-50 text-blue-700 border-blue-200" },
  HIGH: { label: "High", className: "bg-amber-50 text-amber-700 border-amber-200" },
  URGENT: { label: "Urgent", className: "bg-red-50 text-red-700 border-red-200" },
};

export function OrderStatusBadge({ status }: { status: InternalStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
