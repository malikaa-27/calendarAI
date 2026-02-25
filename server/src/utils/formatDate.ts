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
 * When a day has availability spanning 9 AM to 5 PM, says "There is availability from 9AM to 5 PM".
 */
export function formatAvailableSummaryCompact(
  slots: Array<{ start: string; end: string }>,
  locale = 'en-US',
  timeZone?: string
): string {
  if (!slots?.length) return 'No slots available';

  const timeFmt = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric', hour12: true, timeZone });
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'short', day: 'numeric', timeZone });

  const hourFmt = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: timeZone || undefined });
  const toDecHours = (d: Date) => {
    const parts = hourFmt.formatToParts(d);
    return parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10) +
      parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10) / 60;
  };
  const byDay = new Map<string, { dayLabel: string; times: string[]; minStartH: number; maxEndH: number }>();
  for (const s of slots) {
    const start = new Date(s.start);
    const end = new Date(s.end);
    const dayKey = start.toISOString().slice(0, 10);
    const dayLabel = dayFmt.format(start);
    const timeStr = timeFmt.format(start);
    const minStartH = toDecHours(start);
    const maxEndH = toDecHours(end);

    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, { dayLabel, times: [timeStr], minStartH, maxEndH });
    } else {
      const entry = byDay.get(dayKey)!;
      if (entry.times.length === 1 || entry.times[entry.times.length - 1] !== timeStr) {
        entry.times.push(timeStr);
      }
      entry.minStartH = Math.min(entry.minStartH, minStartH);
      entry.maxEndH = Math.max(entry.maxEndH, maxEndH);
    }
  }

  const parts: string[] = [];
  for (const [, entry] of byDay) {
    const { dayLabel, times, minStartH, maxEndH } = entry;
    // Consider "all day" when slots span 9 AM to 5 PM (9.0–17.0)
    const isAllDay = minStartH <= 9.5 && maxEndH >= 17;
    if (isAllDay) {
      parts.push(`${dayLabel}: There is availability from 9AM to 5 PM`);
    } else {
      parts.push(`${dayLabel}: ${times.join(', ')}`);
    }
  }
  return parts.join('; ');
}
