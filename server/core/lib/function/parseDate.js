import { _time, _log } from "@netuno/server-types";

function parseDate(dateStr) {
  if (!dateStr?.trim()) {
    _log.warn(`Empty date. Using placeholder.`);
    return { formattedDate: "2000-01-01", dateQuality: "Unknown" };
  }

  // Case 1: Full date in ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { formattedDate: dateStr, dateQuality: "Exact" };
  }

  // Case 2: Full date
  try {
    const dateObj = _time.localDateParse(dateStr, _time.dateTimeFormatter("d MMMM yyyy"));
    return { formattedDate: _time.dateTimeFormatter("yyyy-MM-dd").format(dateObj), dateQuality: "Exact" };
  } catch {}

  // Case 3: Year and month (YYYY-MM)
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    _log.warn(`Incomplete date (month only): "${dateStr}". Using "${dateStr}-01".`);
    return { formattedDate: `${dateStr}-01`, dateQuality: "Month Only" };
  }

  // Case 4: Year only (YYYY)
  if (/^\d{4}$/.test(dateStr)) {
    _log.warn(`Incomplete date (year only): "${dateStr}". Using "${dateStr}-01-01".`);
    return { formattedDate: `${dateStr}-01-01`, dateQuality: "Year Only" };
  }

  // Case 5: Invalid format
  _log.warn(`Invalid date format: "${dateStr}". Using placeholder.`);
  return { formattedDate: "2000-01-01", dateQuality: "Unknown" };
}
