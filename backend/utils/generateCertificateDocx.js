import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, AlignmentType, HeadingLevel, BorderStyle,
  ShadingType, VerticalAlign,
} from "docx";

function toEthNumeric(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  const jdn = day + Math.floor((153 * mo + 2) / 5) + 365 * yr +
    Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const eyear = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const emonth = Math.floor(n / 30) + 1;
  const eday = (n % 30) + 1;
  return `${String(eday).padStart(2,"0")}/${String(emonth).padStart(2,"0")}/${eyear}`;
}

const BORDER = { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" };
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function labelCell(text) {
  return new TableCell({
    width: { size: 38, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.SOLID, fill: "1A2226" },
    borders: CELL_BORDERS,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })] })],
  });
}

function valueCell(text) {
  return new TableCell({
    width: { size: 62, type: WidthType.PERCENTAGE },
    borders: CELL_BORDERS,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: String(text || "-"), size: 20 })] })],
  });
}

function row(label, value) {
  return new TableRow({ children: [labelCell(label), valueCell(value)] });
}

export async function generateCertificateDocx(app, year) {
  const info = app.applicantInfo;
  const addr = info.address || {};
  const cert = app.certificate;
  const licenseeName = app.hasTradeLicense ? app.businessName || info.fullName : info.fullName;

  const histObj = cert.history?.toObject ? cert.history.toObject() : cert.history || {};
  const yearEntry = histObj[String(year)] || {};
  const issuedAt = yearEntry.issuedAt || cert.issuedAt;

  const fullAddressStr = addr.licenseOwnerAddress || [addr.region, addr.woreda, addr.kebele].filter(Boolean).map(s => String(s).trim()).join("/") || "-";

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: "COMPETENCY CERTIFICATE", bold: true, size: 32, color: "1A2226" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [new TextRun({ text: "Federal Democratic Republic of Ethiopia", size: 22, color: "444444" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [new TextRun({ text: "Ministry of Communication & Information Technology", size: 22, color: "444444" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [new TextRun({ text: app.serviceType?.name || "-", bold: true, size: 24, color: "1A2226" })],
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            row("Reference Number", cert.referenceNumber),
            row("TIN", app.tin || "-"),
            row("Competency Code", app.serviceType?.code || "-"),
            row("Date of Issuance (Ethiopian)", toEthNumeric(issuedAt)),
            row("Year", `${year}${app.applicationType === "renewal" ? " (Renewal)" : ""}`),
            row("Licensee Name", licenseeName),
            row("Region", addr.region || "-"),
            row("Woreda", addr.woreda || "-"),
            row("Kebele", addr.kebele || "-"),
            row("Applicant Address", fullAddressStr),
            row("Phone", info.phone || "-"),
            row("P.O. Box", addr.poBox || "-"),
            row("Fax", addr.fax || "-"),
            row("Email", addr.email || "-"),
            row("Issued By", cert.adminName || "-"),
          ],
        }),
        new Paragraph({
          spacing: { before: 240, after: 80 },
          children: [
            new TextRun({
              text: "ይህ ፈቃድ በቴሌኮሙኒኬሽን አዋጅ ቁጥር 49/1889 (እንደተሸሻለው) አንቀጽ 10 ንዑስ አንቀጽ 4 መሠረት በወጣው የቴሌኮሙኒኬሽን ሪሴል አገልግሎት እና የቴሌ ሴንተር ፈቃድ መመሪያ ቁጥር 1/1995 መሠረት የተሰጠ፡፡",
              bold: true,
              size: 18,
              color: "0F172A",
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: "This license is issued as per the Directive on resale and Telecenter in Telecommunication No1/2002 that is issued on the basis of Article 10 sub-Article 4 of Telecommunication Proclamation No 49/1996 (as amended).",
              italic: true,
              size: 16,
              color: "64748B",
            }),
          ],
        }),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}
