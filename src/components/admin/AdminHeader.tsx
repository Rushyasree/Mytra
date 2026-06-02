"use client";

import { Bell, Search, LogOut, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Global search (Cmd + K)..." 
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-black border-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 dark:hover:bg-black transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </button>

        <div className="h-8 w-px bg-gray-100 dark:border-gray-800 hidden sm:block"></div>

        <div className="flex items-center gap-3 group cursor-pointer relative">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-tight">{session?.user?.name || "Admin"}</p>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mt-0.5">Super Admin</p>
          </div>
          <img 
            src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || 'A'}`} 
            className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
            alt="Avatar"
          />
          
          {/* Dropdown Menu (Simplified) */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all">
            <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-black text-sm font-medium">
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-500 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
