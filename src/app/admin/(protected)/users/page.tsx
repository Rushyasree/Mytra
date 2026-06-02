"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, Calendar, Search } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  image: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">User Directory</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all platform participants.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              className="pl-10 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none text-sm w-full md:w-80 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">User Profile</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Security Role</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Registration</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Unique Identifier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl w-48" /></td>
                    <td className="px-8 py-6"><div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full w-24" /></td>
                    <td className="px-8 py-6"><div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full w-24" /></td>
                    <td className="px-8 py-6"><div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full w-32" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Search className="w-10 h-10 text-gray-200 mb-3" />
                      <p className="text-gray-500 font-bold">No matches found.</p>
                      <p className="text-xs text-gray-400">Try adjusting your search filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-black/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img 
                          src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} 
                          className="w-12 h-12 rounded-[1rem] border-2 border-white dark:border-gray-800 shadow-sm" 
                          alt="" 
                        />
                        <div>
                          <div className="font-black text-secondary dark:text-white">{user.name}</div>
                          <div className="text-xs text-gray-500 font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'ADMIN' ? 'bg-red-50 text-red-500' : 
                        user.role === 'GUIDE' ? 'bg-orange-50 text-orange-500' : 
                        'bg-blue-50 text-blue-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 text-xs font-mono text-gray-300 group-hover:text-gray-500 transition-colors">
                      {user.id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
