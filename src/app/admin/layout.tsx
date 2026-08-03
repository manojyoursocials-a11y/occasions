import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex">
      <AdminSidebar adminName={session.user.name || "Studio Admin"} />
      <main className="min-h-screen flex-1 bg-surface px-8 py-8">{children}</main>
    </div>
  );
}
