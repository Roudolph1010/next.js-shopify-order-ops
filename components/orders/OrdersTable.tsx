import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge, PriorityBadge } from "./OrderStatusBadge";
import { AssignOrderDialog } from "./AssignOrderDialog";
import { Button } from "@/components/ui/button";
import type { InternalStatus, Priority } from "@prisma/client";

interface OrderRow {
  id: string;
  externalOrderNumber: string;
  customerName: string | null;
  customerEmail: string | null;
  shippingMethod: string | null;
  internalStatus: InternalStatus;
  priority: Priority;
  lastSyncedAt: Date | null;
  shopifyCreatedAt: Date | null;
  assignment: {
    user: {
      id: string;
      displayName: string;
      username: string;
    };
  } | null;
}

interface StaffUser {
  id: string;
  displayName: string;
  username: string;
}

interface OrdersTableProps {
  orders: OrderRow[];
  staffList?: StaffUser[];
  showAssignControls?: boolean;
}

export function OrdersTable({
  orders,
  staffList = [],
  showAssignControls = false,
}: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border rounded-lg">
        No orders found
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Shipping</TableHead>
            <TableHead className="w-28">Priority</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="w-36 text-right">Created</TableHead>
            {showAssignControls && <TableHead className="w-28" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/orders/${order.id}`}
                  className="hover:underline text-blue-600"
                >
                  {order.externalOrderNumber}
                </Link>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{order.customerName ?? "—"}</p>
                  {order.customerEmail && (
                    <p className="text-xs text-muted-foreground">
                      {order.customerEmail}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {order.shippingMethod ?? "—"}
              </TableCell>
              <TableCell>
                <PriorityBadge priority={order.priority} />
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.internalStatus} />
              </TableCell>
              <TableCell className="text-sm">
                {order.assignment?.user.displayName ?? (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {order.shopifyCreatedAt
                  ? formatDistanceToNow(new Date(order.shopifyCreatedAt), {
                      addSuffix: true,
                    })
                  : "—"}
              </TableCell>
              {showAssignControls && (
                <TableCell className="text-right">
                  <AssignOrderDialog
                    orderId={order.id}
                    orderNumber={order.externalOrderNumber}
                    staffList={staffList}
                    currentAssignee={order.assignment?.user}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
