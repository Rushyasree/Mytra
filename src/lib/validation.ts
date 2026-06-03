export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return emailPattern.test(email);
}

export function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

export function normalizeCsvList(value: unknown) {
  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return items
    .map((item) => String(item).trim())
    .filter(Boolean)
    .join(", ");
}

export function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
