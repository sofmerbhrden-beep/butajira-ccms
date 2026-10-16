const ET_MONTHS = [
  "Meskerem","Tikimt","Hidar","Tahsas","Tir","Yekatit",
  "Megabit","Miazia","Ginbot","Sene","Hamle","Nehase","Pagume",
];

const ET_MONTHS_AM = [
  "መስከረም","ጥቅምት","ህዳር","ታህሳስ","ጥር","የካቲት",
  "መጋቢት","ሚያዚያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ",
];

export function toEthiopian(date) {
  const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return jdnToEthiopian(jdn);
}

function gregorianToJDN(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr +
    Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
}

function jdnToEthiopian(jdn) {
  const r = (jdn - 1723856) % 1461;
  const n = r % 365 + 365 * Math.floor(r / 1460);
  const year  = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day   = n % 30 + 1;
  return { year, month, day };
}

export function formatEthDateNumeric(date) {
  if (!date) return "-";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return "-";
  const { year, month, day } = toEthiopian(d);
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  const yy = String(year).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

export function formatEthDate(date) {
  return formatEthDateNumeric(date);
}

export function formatEthDateTime(date) {
  if (!date) return "-";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return "-";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatEthDateNumeric(d)} · ${hh}:${mm}`;
}

export function formatEthRelative(date, lang = "en") {
  if (!date) return "-";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return "-";
  const diffMs  = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (lang === "am") {
    if (diffMin < 1)  return "አሁን";
    if (diffMin < 60) return `ከ${diffMin} ደቂቃ በፊት`;
    if (diffHr  < 24) return `ከ${diffHr} ሰዓት በፊት`;
    if (diffDay < 7)  return `ከ${diffDay} ቀን በፊት`;
    return formatEthDateNumeric(d);
  }
  if (diffMin < 1)  return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr  < 24) return `${diffHr}h ago`;
  if (diffDay < 7)  return `${diffDay}d ago`;
  return formatEthDateNumeric(d);
}

export function ethYear(date = new Date()) {
  return toEthiopian(date).year;
}
