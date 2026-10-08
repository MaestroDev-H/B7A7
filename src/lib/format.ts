import { format, formatDistanceToNow, parseISO } from "date-fns";

/**
 * Safely format monetary amount in USD ($X.XX or $X)
 */
export function formatMoney(
  amount: string | number | null | undefined,
  options?: { showCents?: boolean; currency?: string }
): string {
  if (amount === null || amount === undefined || amount === "") {
    return "$0.00";
  }

  const num = typeof amount === "number" ? amount : Number.parseFloat(String(amount));
  if (Number.isNaN(num)) {
    return "$0.00";
  }

  const currency = options?.currency || "USD";
  const showCents = options?.showCents !== undefined ? options.showCents : true;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Parse any date input into a valid Date object
 */
function parseDateInput(input: string | Date | number): Date | null {
  try {
    if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
    if (typeof input === "number") return new Date(input);
    if (typeof input === "string") {
      const parsed = parseISO(input);
      if (!Number.isNaN(parsed.getTime())) return parsed;
      const fallback = new Date(input);
      return Number.isNaN(fallback.getTime()) ? null : fallback;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Format date nicely, e.g. "Oct 8, 2026"
 */
export function formatDate(
  dateInput: string | Date | number | null | undefined,
  pattern = "MMM d, yyyy"
): string {
  if (!dateInput) return "N/A";
  const d = parseDateInput(dateInput);
  if (!d) return "Invalid date";
  return format(d, pattern);
}

/**
 * Format date and time, e.g. "Oct 8, 2026 at 2:30 PM"
 */
export function formatDateTime(
  dateInput: string | Date | number | null | undefined
): string {
  if (!dateInput) return "N/A";
  const d = parseDateInput(dateInput);
  if (!d) return "Invalid date";
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Relative time ago, e.g. "2 hours ago"
 */
export function relativeTime(
  dateInput: string | Date | number | null | undefined
): string {
  if (!dateInput) return "N/A";
  const d = parseDateInput(dateInput);
  if (!d) return "Invalid date";
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Converts date string and optional time to strict ISO 8601 UTC string ending with 'Z'
 */
export function toISODateTime(dateInput: string | Date, timeInput?: string): string {
  let date: Date;

  if (typeof dateInput === "string") {
    if (timeInput) {
      date = new Date(`${dateInput}T${timeInput}`);
    } else if (dateInput.includes("T")) {
      date = new Date(dateInput);
    } else {
      date = new Date(`${dateInput}T00:00:00Z`);
    }
  } else {
    date = dateInput;
  }

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date input provided to toISODateTime");
  }

  return date.toISOString();
}

/**
 * Converts uppercase screaming snake case enum to human readable title (e.g. UNDER_MAINTENANCE -> "Under maintenance")
 */
export function enumLabel(enumValue: string | null | undefined): string {
  if (!enumValue) return "";
  const words = enumValue.toLowerCase().split("_");
  return words
    .map((w, idx) => (idx === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}
