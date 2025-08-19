import { format } from "date-fns"

export function formatDateTime(isoString: string | Date): string {
  if (!isoString) return "N/A"
  try {
    const date = typeof isoString === "string" ? new Date(isoString) : isoString
    if (isNaN(date.getTime())) {
      return "Invalid Date"
    }
    return format(date, "MMM dd, yyyy HH:mm")
  } catch (e) {
    console.error("Error formatting date:", e)
    return "Invalid Date"
  }
}
