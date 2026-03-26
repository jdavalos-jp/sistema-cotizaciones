function pad2(n) {
  return String(n).padStart(2, '0');
}

function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

function extractJsDate(value) {
  if (!value) return null;

  if (value instanceof Date) return isValidDate(value) ? value : null;

  // dayjs / moment-like
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      const d = value.toDate();
      if (isValidDate(d)) return d;
    }

    // dayjs stores underlying Date in $d
    if (isValidDate(value.$d)) return value.$d;

    // Some pickers wrap under `value`
    if (isValidDate(value.value)) return value.value;
    if (typeof value.value?.toDate === 'function') {
      const d = value.value.toDate();
      if (isValidDate(d)) return d;
    }
  }

  // string-ish (including objects with custom toString)
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return null;

    // date-only
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(`${s}T00:00:00Z`);
      return isValidDate(d) ? d : null;
    }

    const d = new Date(s);
    return isValidDate(d) ? d : null;
  }

  return null;
}

function toDateOnlyString(value) {
  if (value === null || value === undefined) return '';

  if (typeof value === 'string') {
    const s = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  }

  const d = extractJsDate(value);
  if (!d) return '';

  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function toUtcMidnightDate(value) {
  const ymd = toDateOnlyString(value);
  if (!ymd) return null;
  const d = new Date(`${ymd}T00:00:00Z`);
  return isValidDate(d) ? d : null;
}

function formatDateDMY(value) {
  const ymd = toDateOnlyString(value);
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-');
  return `${d}/${m}/${y}`;
}

module.exports = {
  toDateOnlyString,
  toUtcMidnightDate,
  formatDateDMY,
};
