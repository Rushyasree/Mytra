"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BookOpen, 
  IndianRupee, 
  ShieldCheck, 
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Revenue", href: "/admin/revenue", icon: IndianRupee },
  { label: "Guides Approval", href: "/admin/guides", icon: UserCheck },
  { label: "Bookings", href: "/admin/bookings", icon: BookOpen },
  { label: "All Users", href: "/admin/users", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Fraud & Security", href: "/admin/fraud", icon: ShieldCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-2xl"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 lg:translate-x-0 lg:static
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-8">
            <Link href="/" className="text-2xl font-black text-primary tracking-tighter">
              Mytra<span className="text-accent text-sm ml-0.5 font-bold uppercase tracking-widest">Admin</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group
                    ${isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-gray-500 hover:bg-gray-50 dark:hover:bg-black hover:text-primary"
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-primary"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-6">
            <div className="bg-gray-50 dark:bg-black rounded-3xl p-4 border border-gray-100 dark:border-gray-800">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">System Version</p>
               <p className="text-xs font-bold">v1.2.4-stable</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
