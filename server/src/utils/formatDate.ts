export function formatSlotReadable(startIso: string, endIso: string, locale = 'en-US', timeZone?: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric', timeZone });
  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric', hour12: true, timeZone });

  const day = dayFormatter.format(start);
  const startTime = timeFormatter.format(start);
  const endTime = timeFormatter.format(end);

  return `${day}, ${startTime} - ${endTime}`;
}

export function formatIsoRange(startIso: string, endIso: string, locale = 'en-US', timeZone?: string) {
  return {
    start: startIso,
    end: endIso,
    readable: formatSlotReadable(startIso, endIso, locale, timeZone)
  };
}

/**
 * Compact summary for voice: "Friday Feb 27: 11 AM, 11:30 AM, 12 PM"
 * Groups slots by day so the date is said once, not repeated per slot.
 */
export function formatAvailableSummaryCompact(
  slots: Array<{ start: string; end: string }>,
  locale = 'en-US',
  timeZone?: string
): string {
  if (!slots?.length) return 'No slots available';

  const timeFmt = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric', hour12: true, timeZone });
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'short', day: 'numeric', timeZone });

  const byDay = new Map<string, string[]>();
  for (const s of slots) {
    const d = new Date(s.start);
    const dayKey = d.toISOString().slice(0, 10);
    const dayLabel = dayFmt.format(d);
    const timeStr = timeFmt.format(d);
    if (!byDay.has(dayKey)) byDay.set(dayKey, [dayLabel]);
    const arr = byDay.get(dayKey)!;
    if (arr.length === 1) arr.push(timeStr);
    else if (arr[arr.length - 1] !== timeStr) arr.push(timeStr);
  }

  const parts: string[] = [];
  for (const [, arr] of byDay) {
    const dayLabel = arr[0];
    const times = arr.slice(1).join(', ');
    parts.push(`${dayLabel}: ${times}`);
  }
  return parts.join('; ');
}
