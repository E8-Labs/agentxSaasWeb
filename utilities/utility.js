import { DateTime } from "luxon";
import moment from "moment";

export function GetTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function convertUTCToTimezone(utcTimestamp, timezone = null) {
  if (timezone == null) {
    timezone = GetTimezone();
  }
  console.log("Time zone to convert to is ", timezone);
  return DateTime.fromISO(utcTimestamp, { zone: "utc" })
    .setZone(timezone)
    .toFormat("yyyy-MM-dd h:mm:ss");
}

export function GetFormattedDateString(
  dateString,
  time = false,
  RequiredDateFormat = null
) {
  if (typeof dateString == "undefined" || dateString == null) {
    return dateString;
  }
  let formatted = "";
  // console.log("Created At before", dateString);
  let dateFormat = RequiredDateFormat ? RequiredDateFormat : "MMM DD, YYYY";
  if (time) {
    dateFormat = RequiredDateFormat
      ? RequiredDateFormat
      : "MMM DD, YYYY h:mm A";
  }
  try {
    // Check if the date string ends with "Z" (indicating UTC)
    if (dateString.endsWith("Z")) {
      console.log("The date string is in UTC.");

      // Parse the date string as UTC and convert to local timezone
      const dateInLocalTz = moment.utc(dateString).local();

      // Format the date as "Jan 02, 2025 12:30 PM"
      formatted = dateInLocalTz.format(dateFormat);
    } else {
      console.log("The date string is not in UTC.");

      // Assume the date string is already in the local timezone
      const dateInLocalTz = moment(dateString);

      // Format the date as "Jan 02, 2025 12:30 PM"
      formatted = dateInLocalTz.format(dateFormat);
    }
  } catch (error) {
    console.error("Error parsing or formatting date:", error);
  }
  console.log("Created At after", formatted);
  return formatted;
}

export function GetFormattedTimeString(dateString) {
  if (typeof dateString == "undefined" || dateString == null) {
    return dateString;
  }
  let formatted = "";
  // console.log("Created At before", dateString);
  let dateFormat = "h:mm A";

  try {
    // Check if the date string ends with "Z" (indicating UTC)
    if (dateString.endsWith("Z")) {
      console.log("The date string is in UTC.");

      // Parse the date string as UTC and convert to local timezone
      const dateInLocalTz = moment.utc(dateString).local();

      // Format the date as "Jan 02, 2025 12:30 PM"
      formatted = dateInLocalTz.format(dateFormat);
    } else {
      console.log("The date string is not in UTC.");

      // Assume the date string is already in the local timezone
      const dateInLocalTz = moment(dateString);

      // Format the date as "Jan 02, 2025 12:30 PM"
      formatted = dateInLocalTz.format(dateFormat);
    }
  } catch (error) {
    console.error("Error parsing or formatting date:", error);
  }
  console.log("Created At after", formatted);
  return formatted;
}
