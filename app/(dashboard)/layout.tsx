import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const pageTitle =
    session.role === "ADMIN" ? "Admin Dashboard" : "My Assignments";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={session.role} displayName={session.displayName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
