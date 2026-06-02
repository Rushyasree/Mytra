"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  Compass,
  Wallet
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Trips", href: "/dashboard/trips", icon: Map },
    { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col h-full hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <Compass className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
          <span className="font-bold text-xl tracking-tight text-secondary dark:text-white">
            Mytra
          </span>
        </Link>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
          Dashboard
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full">
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
