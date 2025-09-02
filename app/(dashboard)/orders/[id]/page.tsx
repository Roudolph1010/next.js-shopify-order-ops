import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getOrderById } from "@/lib/services/order.service";
import { getAllStaffUsers } from "@/lib/services/user.service";
import { OrderStatusBadge, PriorityBadge } from "@/components/orders/OrderStatusBadge";
import { AssignOrderDialog } from "@/components/orders/AssignOrderDialog";
import { UpdateStatusForm } from "@/components/orders/UpdateStatusForm";
import { NotesList } from "@/components/notes/NotesList";
import { AddNoteForm } from "@/components/notes/AddNoteForm";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ActivityAction, Role } from "@prisma/client";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  // Staff can only view their own assigned orders
  if (
    session.role === "STAFF" &&
    order.assignment?.user.username !== session.username
  ) {
    redirect("/staff");
  }

  const staffList =
    session.role === "ADMIN" ? await getAllStaffUsers() : [];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href={session.role === "ADMIN" ? "/admin" : "/staff"}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">
                {order.externalOrderNumber}
              </h1>
              <OrderStatusBadge status={order.internalStatus} />
              <PriorityBadge priority={order.priority} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {order.customerName ?? "Unknown customer"}
              {order.customerEmail && (
                <> · <a href={`mailto:${order.customerEmail}`} className="hover:underline">{order.customerEmail}</a></>
              )}
            </p>
          </div>

          {session.role === "ADMIN" && (
            <AssignOrderDialog
              orderId={order.id}
              orderNumber={order.externalOrderNumber}
              staffList={staffList}
              currentAssignee={order.assignment?.user}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.variantTitle && (
                        <p className="text-xs text-muted-foreground">
                          {item.variantTitle}
                        </p>
                      )}
                      {item.sku && (
                        <p className="text-xs text-muted-foreground font-mono">
                          SKU: {item.sku}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Work Status</CardTitle>
            </CardHeader>
            <CardContent>
              <UpdateStatusForm
                orderId={order.id}
                currentStatus={order.internalStatus}
              />
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotesList
                notes={order.notes.map((n) => ({
                  ...n,
                  createdAt: new Date(n.createdAt),
                }))}
              />
              <Separator />
              <AddNoteForm orderId={order.id} />
            </CardContent>
          </Card>

          {/* Activity timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed
                logs={order.activityLogs.map((log) => ({
                  ...log,
                  metadata: (log.metadata as Record<string, unknown>) ?? {},
                  createdAt: new Date(log.createdAt),
                  action: log.action as ActivityAction,
                  user: log.user
                    ? {
                        displayName: log.user.displayName,
                        role: log.user.role as Role,
                      }
                    : null,
                }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Fulfillment Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Fulfillment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Shipping method
                </p>
                <p>{order.shippingMethod ?? "—"}</p>
              </div>
              {order.shippingAddress && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Ship to
                  </p>
                  <p className="whitespace-pre-wrap text-xs">
                    {order.shippingAddress}
                  </p>
                </div>
              )}
              {order.tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {order.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-muted px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {order.deliveryNotes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Delivery notes
                  </p>
                  <p className="text-xs">{order.deliveryNotes}</p>
                </div>
              )}
              {order.fulfillmentNotes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Fulfillment notes
                  </p>
                  <p className="text-xs">{order.fulfillmentNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {order.assignment ? (
                <div>
                  <p className="font-medium">{order.assignment.user.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    Assigned{" "}
                    {format(new Date(order.assignment.assignedAt), "MMM d, yyyy")}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Unassigned</p>
              )}
            </CardContent>
          </Card>

          {/* Shopify Sync Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Shopify Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div>
                <p className="mb-0.5">Shopify ID</p>
                <p className="font-mono break-all">{order.externalId}</p>
              </div>
              {order.externalStatus && (
                <div>
                  <p className="mb-0.5">Shopify status</p>
                  <p>{order.externalStatus}</p>
                </div>
              )}
              {order.shopifyCreatedAt && (
                <div>
                  <p className="mb-0.5">Created in Shopify</p>
                  <p>{format(new Date(order.shopifyCreatedAt), "MMM d, yyyy HH:mm")}</p>
                </div>
              )}
              {order.lastSyncedAt && (
                <div>
                  <p className="mb-0.5">Last synced</p>
                  <p>{format(new Date(order.lastSyncedAt), "MMM d, yyyy HH:mm")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
