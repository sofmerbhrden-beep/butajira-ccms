import { nextSequence, setSequenceIfHigher } from "../models/Counter.js";

export function toEthiopianYear(date = new Date()) {
  const month = date.getMonth();
  const day = date.getDate();
  const gregYear = date.getFullYear();

  return gregYear - (month > 8 || (month === 8 && day >= 11) ? 7 : 8);
}

export async function nextReferenceNumber() {
  const year = toEthiopianYear();
  const seq = await nextSequence(`certRef:${year}`);
  return `${seq}/${year}`;
}

export async function nextAppId() {
  const seq = await nextSequence("appId", 1000);
  return `APP-${seq}`;
}

export async function updateReferenceNumberCounter(refNumber) {
  const [seqStr, yearStr] = refNumber.split("/");
  if (!seqStr || !yearStr) return;
  const seq = parseInt(seqStr, 10);
  const year = parseInt(yearStr, 10);
  if (!isNaN(seq) && !isNaN(year)) {
    await setSequenceIfHigher(`certRef:${year}`, seq);
  }
}
