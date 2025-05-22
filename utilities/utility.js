import { DateTime } from "luxon";
import moment from "moment";

export function GetTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function convertUTCToTimezone(utcTimestamp, timezone = null) {
  if (timezone == null) {
    timezone = GetTimezone();
  }
  // //console.log;
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
  // //console.log;
  let dateFormat = RequiredDateFormat ? RequiredDateFormat : "MMM DD, YYYY";
  if (time) {
    dateFormat = RequiredDateFormat
      ? RequiredDateFormat
      : "MMM DD, YYYY h:mm A";
  }
  try {
    // Check if the date string ends with "Z" (indicating UTC)
    if (dateString.endsWith("Z")) {
      // //console.log;

      // Parse the date string as UTC and convert to local timezone
      const dateInLocalTz = moment.utc(dateString).local();

      // Format the date as "Jan 02, 2025 12:30 PM"
      formatted = dateInLocalTz.format(dateFormat);
    } else {
      // //console.log;

      // Assume the date string is already in the local timezone
      const dateInLocalTz = moment(dateString);

      // Format the date as "Jan 02, 2025 12:30 PM"
      formatted = dateInLocalTz.format(dateFormat);
    }
  } catch (error) {
    console.error("Error parsing or formatting date:", error);
  }
  // //console.log;
  return formatted;
}
export function GetFormattedTimeString(dateString) {
  if (!dateString) {
    return dateString;
  }

  let dateFormat = "h:mm A"; // Example: "12:30 PM"

  try {
    // Always treat input as UTC and convert to local time
    const dateInLocalTz = moment.utc(dateString).local();

    // Format and return the converted local time
    return dateInLocalTz.format(dateFormat);
  } catch (error) {
    console.error("Error parsing or formatting date:", error);
    return dateString; // Return the original string if error occurs
  }
}

//formating time
// utils/convertTime.js
export function convertSecondsToMinDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // If remaining seconds are zero, return only minutes
  if (remainingSeconds === 0) {
    return `${minutes} Min`;
  }

  // Otherwise, return minutes and seconds
  return `${minutes} Min ${remainingSeconds.toString().padStart(2, "0")} Sec`;
}


export function ToUppercase(text) {
  if (text == null || text == "" || text == undefined) {
    return ""
  }
  
  return `${text.slice(0, 1)
    .toUpperCase()
}${
  text.slice(
    1
  )}`
}
