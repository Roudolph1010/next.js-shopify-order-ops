import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { getAssignedOrdersForUser } from "@/lib/services/assignment.service";
import { getUserByUsername } from "@/lib/services/user.service";
import { OrderStatusBadge, PriorityBadge } from "@/components/orders/OrderStatusBadge";
import { Card, CardContent } from "@/components/ui/card";

export default async function StaffPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUserByUsername(session.username);
  if (!user) redirect("/login");

  const orders = await getAssignedOrdersForUser(user.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold">My Assignments</h2>
        <p className="text-sm text-muted-foreground">
          {orders.length} active order{orders.length !== 1 ? "s" : ""} assigned to you
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border rounded-lg">
          No orders assigned to you
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {order.externalOrderNumber}
                        </span>
                        <PriorityBadge priority={order.priority} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.customerName ?? "Unknown customer"}
                        {order.customerEmail && ` · ${order.customerEmail}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        {order.shippingMethod && ` · ${order.shippingMethod}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <OrderStatusBadge status={order.internalStatus} />
                      <span className="text-xs text-muted-foreground">
                        {order.shopifyCreatedAt
                          ? formatDistanceToNow(new Date(order.shopifyCreatedAt), {
                              addSuffix: true,
                            })
                          : ""}
                      </span>
                    </div>
                  </div>

                  {order.deliveryNotes && (
                    <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                      {order.deliveryNotes}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
