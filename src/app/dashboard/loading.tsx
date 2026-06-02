export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm h-40">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4"></div>
            <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Upcoming Trip Skeleton */}
      <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-48 h-32 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
            <div className="flex-1 w-full space-y-4">
              <div className="flex justify-between">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
              </div>
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded"></div>
              <div className="bg-gray-50 dark:bg-black p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
