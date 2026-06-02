// Guide Dashboard Layout

export default function GuideDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-black">
      <GuideSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

function GuideSidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col h-full hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <span className="font-bold text-lg text-secondary dark:text-white">🎓 Guide Portal</span>
      </div>
      <div className="p-4 flex-1">
        <nav className="space-y-1">
          {[
            { name: "Overview", href: "/guide-dashboard" },
            { name: "Booking Requests", href: "/guide-dashboard/requests" },
            { name: "My Earnings", href: "/guide-dashboard/earnings" },
            { name: "Availability", href: "/guide-dashboard/availability" },
            { name: "Reviews", href: "/guide-dashboard/reviews" },
            { name: "My Packages", href: "/guide-dashboard/packages" },
            { name: "Settings", href: "/guide-dashboard/settings" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
