function toEthiopianYear(date = new Date()) {
  const month = date.getMonth();
  const day = date.getDate();
  const gregYear = date.getFullYear();
  return gregYear - (month > 8 || (month === 8 && day >= 11) ? 7 : 8);
}

export function nextReferenceNumber(existingRefs) {
  const year = toEthiopianYear();
  const thisYearSeqs = existingRefs
    .filter((r) => r && r.endsWith(`/${year}`))
    .map((r) => parseInt(r.split("/")[0], 10))
    .filter((n) => !Number.isNaN(n));

  const next = thisYearSeqs.length ? Math.max(...thisYearSeqs) + 1 : 1;
  return `${next}/${year}`;
}
