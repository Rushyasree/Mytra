import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <X className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-gray-500">You do not have the administrative privileges required to access this portal.</p>
          <Link href="/">
            <Button size="lg" className="rounded-xl px-10">Return to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-black overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 dark:bg-black">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
