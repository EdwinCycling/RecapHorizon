export function buildRecapHorizonFilename(ext: string, locale?: string) {
  const d = new Date();
  const loc = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
  const dateStr = new Intl.DateTimeFormat(loc, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const timeStr = new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(d);
  const sanitized = `${dateStr} ${timeStr}`
    .replace(/[\/:]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z0-9 _\-]/g, '')
    .replace(/\s/g, '_');
  return `RecapHorizon-${sanitized}.${ext}`;
}