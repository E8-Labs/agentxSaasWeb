import { DateTime } from "luxon";

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
    .toFormat("yyyy-MM-dd HH:mm:ss");
}
