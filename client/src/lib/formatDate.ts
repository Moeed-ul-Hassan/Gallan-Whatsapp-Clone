import { format, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns";

export function formatMessageDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else if (isThisWeek(date)) {
    return format(date, "EEEE"); // Monday, Tuesday, etc.
  } else if (isThisYear(date)) {
    return format(date, "MMM d"); // Jan 1, Feb 2, etc.
  } else {
    return format(date, "MMM d, yyyy"); // Jan 1, 2022, etc.
  }
}

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "h:mm a"); // 12:00 AM, 1:30 PM, etc.
}

export function formatLastSeen(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return `Last seen today at ${format(date, "h:mm a")}`;
  } else if (isYesterday(date)) {
    return `Last seen yesterday at ${format(date, "h:mm a")}`;
  } else if (isThisWeek(date)) {
    return `Last seen ${format(date, "EEEE")} at ${format(date, "h:mm a")}`;
  } else if (isThisYear(date)) {
    return `Last seen ${format(date, "MMM d")} at ${format(date, "h:mm a")}`;
  } else {
    return `Last seen ${format(date, "MMM d, yyyy")} at ${format(date, "h:mm a")}`;
  }
}

export function formatChatTime(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, "h:mm a"); // 12:00 AM, 1:30 PM, etc.
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else if (isThisWeek(date)) {
    return format(date, "EEE"); // Mon, Tue, etc.
  } else if (isThisYear(date)) {
    return format(date, "MM/dd/yy"); // 01/01/22
  } else {
    return format(date, "MM/dd/yy"); // 01/01/22
  }
}
