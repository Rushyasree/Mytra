export function logDatabasePageError(page: string, error: unknown) {
  console.error(`[database:${page}]`, error);
}

export async function safeDatabaseQuery<T>(
  page: string,
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    logDatabasePageError(page, error);
    return fallback;
  }
}
