import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getOrders, getOrderCounts } from "@/lib/services/order.service";
import { getAllStaffUsers, getStaffWorkload } from "@/lib/services/user.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderFilterBar } from "@/components/orders/OrderFilterBar";
import { SyncButton } from "@/components/orders/SyncButton";
import { Skeleton } from "@/components/ui/skeleton";
import type { InternalStatus, Priority } from "@prisma/client";

interface AdminPageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    search?: string;
  }>;
}

async function SummaryCards() {
  const counts = await getOrderCounts();
  const cards = [
    { label: "Unassigned", value: counts.unassigned },
    { label: "Assigned", value: counts.assigned },
    { label: "In Progress", value: counts.inProgress },
    { label: "Packed", value: counts.packed },
    { label: "Completed", value: counts.completed },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function StaffWorkloadSection() {
  const staff = await getStaffWorkload();

  if (staff.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No staff accounts yet.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {staff.map((member) => {
        const active = member.assignments.filter((a) => !a.unassignedAt);
        return (
          <Card key={member.id} className="w-48">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-sm font-medium">
                {member.displayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground">
                {active.length} active order{active.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const params = await searchParams;

  const [orders, staffList] = await Promise.all([
    getOrders({
      status: params.status as InternalStatus | undefined,
      priority: params.priority as Priority | undefined,
      search: params.search,
    }),
    getAllStaffUsers(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Orders</h2>
        <SyncButton />
      </div>

      <Suspense fallback={<Skeleton className="h-20 w-full" />}>
        <SummaryCards />
      </Suspense>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Staff workload
        </h3>
        <Suspense fallback={<Skeleton className="h-16 w-full" />}>
          <StaffWorkloadSection />
        </Suspense>
      </div>

      <div className="space-y-3">
        <OrderFilterBar />
        <OrdersTable
          orders={orders}
          staffList={staffList}
          showAssignControls
        />
      </div>
    </div>
  );
}
