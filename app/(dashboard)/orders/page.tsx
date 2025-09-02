import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getOrders } from "@/lib/services/order.service";
import { getAllStaffUsers } from "@/lib/services/user.service";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderFilterBar } from "@/components/orders/OrderFilterBar";
import type { InternalStatus, Priority } from "@prisma/client";

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    search?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;

  const [orders, staffList] = await Promise.all([
    getOrders({
      status: params.status as InternalStatus | undefined,
      priority: params.priority as Priority | undefined,
      search: params.search,
    }),
    session.role === "ADMIN" ? getAllStaffUsers() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Orders</h2>
      <OrderFilterBar />
      <OrdersTable
        orders={orders}
        staffList={staffList}
        showAssignControls={session.role === "ADMIN"}
      />
    </div>
  );
}
