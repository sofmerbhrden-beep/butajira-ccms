import fs from "fs";
import path from "path";
import Application from "../models/Application.js";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  ImageRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
} from "docx";

function toEthiopian(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear(),
    m = d.getMonth() + 1,
    day = d.getDate();
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  const jdn =
    day +
    Math.floor((153 * mo + 2) / 5) +
    365 * yr +
    Math.floor(yr / 4) -
    Math.floor(yr / 100) +
    Math.floor(yr / 400) -
    32045;
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const eyear =
    4 * Math.floor((jdn - 1723856) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const emonth = Math.floor(n / 30) + 1;
  const eday = (n % 30) + 1;
  const dd = String(eday).padStart(2, "0");
  const mm = String(emonth).padStart(2, "0");
  return `${dd}/${mm}/${eyear}`;
}

function ethiopianToGregorian(eyear, emonth, eday) {
  const jdn =
    eyear * 365 + Math.floor(eyear / 4) + 30 * (emonth - 1) + eday + 1723856;
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const mo = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * mo + 2) / 5) + 1;
  const month = mo + 3 - 12 * Math.floor(mo / 10);
  const year = 100 * b + d - 4800 + Math.floor(mo / 10);
  return new Date(year, month - 1, day);
}

function formatEthiopianDateTime(date = new Date()) {
  const ethDate = toEthiopian(date);
  const gHours = date.getHours();
  const gMinutes = String(date.getMinutes()).padStart(2, "0");
  const gSeconds = String(date.getSeconds()).padStart(2, "0");
  
  const ethHours = (gHours + 6) % 12 || 12;
  const isDay = gHours >= 6 && gHours < 18;
  const ampm = isDay ? "AM" : "PM";

  return `${ethDate}, ${ethHours}:${gMinutes}:${gSeconds} ${ampm}`;
}

async function buildReportData(from, to) {
  const match = { submittedAt: { $gte: from, $lte: to } };

  const apps = await Application.find(match).sort({ submittedAt: 1 }).lean();

  const totalCount = apps.length;
  let renewedCount = 0;
  let newCount = 0;

  const rows = apps.map((app, index) => {
    const isRenewal = app.applicationType === "renewal";
    if (isRenewal) {
      renewedCount++;
    } else {
      newCount++;
    }

    const name = app.businessName || app.applicantInfo?.fullName || "-";

    let address = "-";
    const addrObj = app.applicantInfo?.address || app.applicant?.address;
    if (addrObj) {
      const { region, woreda, kebele, licenseOwnerAddress } = addrObj;
      if (licenseOwnerAddress && String(licenseOwnerAddress).trim()) {
        address = String(licenseOwnerAddress).trim();
      } else {
        const parts = [region, woreda, kebele]
          .map((p) => String(p || "").trim())
          .filter(Boolean);
        if (parts.length > 0) {
          address = parts.join("/").replace(/\/+/g, "/");
        }
      }
    }

    const serviceName = app.serviceType?.nameAm || app.serviceType?.name || "-";
    const tinNum = app.tin || "-";

    return {
      index: index + 1,
      name,
      address,
      renewed: isRenewal ? "✔" : "",
      notRenewed: !isRenewal ? "✔" : "",
      serviceName,
      tinNum,
    };
  });

  return {
    rows,
    totalCount,
    renewedCount,
    newCount,
  };
}

export async function getReport(req, res) {
  try {
    const { from, to } = req.query;
    if (!from || !to)
      return res
        .status(400)
        .json({ message: "from and to are required (DD/MM/YYYY Ethiopian)" });

    const [fd, fm, fy] = from.split("/").map(Number);
    const [td, tm, ty] = to.split("/").map(Number);
    const fromDate = ethiopianToGregorian(fy, fm, fd);
    const toDate = ethiopianToGregorian(ty, tm, td);
    toDate.setHours(23, 59, 59, 999);

    const data = await buildReportData(fromDate, toDate);
    res.json({ from, to, ...data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function downloadReport(req, res) {
  try {
    const { from, to } = req.query;
    if (!from || !to)
      return res.status(400).json({ message: "from and to required" });

    const [fd, fm, fy] = from.split("/").map(Number);
    const [td, tm, ty] = to.split("/").map(Number);
    const fromDate = ethiopianToGregorian(fy, fm, fd);
    const toDate = ethiopianToGregorian(ty, tm, td);
    toDate.setHours(23, 59, 59, 999);

    const data = await buildReportData(fromDate, toDate);
    const buf = await buildDocx(data, from, to);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="competency-report-${from}-${to}.docx"`,
    );
    return res.send(buf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function buildDocx(data, from, to) {
  const { rows, totalCount, renewedCount, newCount } = data;

  const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" };
  const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
  const HEADER_SHADING = { fill: "E2E8F0", val: ShadingType.CLEAR, color: "auto" };

  function headerCell(text, widthPercent = null) {
    return new TableCell({
      shading: HEADER_SHADING,
      borders: CELL_BORDERS,
      verticalAlign: VerticalAlign.CENTER,
      width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
      margins: { top: 120, bottom: 120, left: 100, right: 100 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: text, bold: true, size: 20, color: "0F172A" })],
        }),
      ],
    });
  }

  function dataCell(text, align = AlignmentType.CENTER, isBold = false) {
    return new TableCell({
      borders: CELL_BORDERS,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text: String(text ?? ""), bold: isBold, size: 20, color: "1E293B" })],
        }),
      ],
    });
  }

  const table1 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: CELL_BORDERS,
    rows: [
      new TableRow({
        children: [
          headerCell("ተ.ቁ", 6),
          headerCell("የድርጅቱ / የግለሰቡ ስም", 24),
          headerCell("አድራሻ", 18),
          headerCell("በበጀት አመት ታድሷል", 12),
          headerCell("በበጀት አመት አልታደሰም", 12),
          headerCell("የብቃት ማረጋገጫ ዓይነት", 18),
          headerCell("ቲን ቁጥር", 10),
        ],
      }),
      ...rows.map((r) =>
        new TableRow({
          children: [
            dataCell(r.index, AlignmentType.CENTER),
            dataCell(r.name, AlignmentType.LEFT),
            dataCell(r.address, AlignmentType.LEFT),
            dataCell(r.renewed, AlignmentType.CENTER, true),
            dataCell(r.notRenewed, AlignmentType.CENTER, true),
            dataCell(r.serviceName, AlignmentType.LEFT),
            dataCell(r.tinNum, AlignmentType.CENTER),
          ],
        })
      ),
    ],
  });

  const table2 = new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    borders: CELL_BORDERS,
    rows: [
      new TableRow({
        children: [
          headerCell("ማጠቃለያ", 70),
          headerCell("ብዛት", 30),
        ],
      }),
      new TableRow({
        children: [
          dataCell("ጠቅላላ የብቃት ማረጋገጫ", AlignmentType.LEFT),
          dataCell(totalCount, AlignmentType.CENTER, true),
        ],
      }),
      new TableRow({
        children: [
          dataCell("የብቃት ማረጋገጫ ያደሱ", AlignmentType.LEFT),
          dataCell(renewedCount, AlignmentType.CENTER, true),
        ],
      }),
      new TableRow({
        children: [
          dataCell("በአዲስ መልክ በዚህ በጀት ዓመት የብቃት ማረጋገጫ ያወጡ", AlignmentType.LEFT),
          dataCell(newCount, AlignmentType.CENTER, true),
        ],
      }),
    ],
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Nyala", size: 22, color: "000000" },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: `የወጣበት ቀንና ሰዓት: ${formatEthiopianDateTime()}`,
                bold: true,
                size: 18,
                color: "555555",
              }),
            ],
          }),

          ...(fs.existsSync(path.join(process.cwd(), "../frontend/public/logo2.png"))
            ? [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 100 },
                children: [
                  new ImageRun({
                    data: fs.readFileSync(path.join(process.cwd(), "../frontend/public/logo2.png")),
                    transformation: { width: 75, height: 75 },
                    type: "png",
                  }),
                ],
              }),
            ]
            : fs.existsSync(path.join(process.cwd(), "../frontend/public/logo.png"))
            ? [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 100 },
                children: [
                  new ImageRun({
                    data: fs.readFileSync(path.join(process.cwd(), "../frontend/public/logo.png")),
                    transformation: { width: 75, height: 75 },
                    type: "png",
                  }),
                ],
              }),
            ]
            : []),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: "የቡታጅራ ከተማ አስተዳደር የሳይንስና ቴክኖሎጂ ጽ/ቤት",
                bold: true,
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: "Butajira Competency Certification Office",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 200, line: 280 },
            children: [
              new TextRun({
                text: "ይህ ሪፖርት በበጀት አመቱ የተሰጡ እና የታደሱ የብቃት ማረጋገጫ ፈቃዶችን ዝርዝር የሚያሳይ ይፋዊ ማጠቃለያ ነው። ሪፖርቱ የተዘጋጀው በትክክለኛ መረጃዎች ላይ ተመስርቶ ለሚመለከተው አካል እንዲቀርብ ነው።",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 240 },
            children: [
              new TextRun({
                text: "የብቃት ማረጋገጫ ሪፖርት",
                bold: true,
                size: 26,
                underline: {},
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 140, after: 100 },
            children: [
              new TextRun({
                text: "ሠንጠረዥ 1: የብቃት ማረጋገጫ ዝርዝር",
                bold: true,
                size: 22,
              }),
            ],
          }),
          table1,

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 280, after: 100 },
            children: [
              new TextRun({
                text: "ሠንጠረዥ 2: ማጠቃለያ",
                bold: true,
                size: 22,
              }),
            ],
          }),
          table2,

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 400, after: 140 },
            children: [
              new TextRun({
                text: "ሪፖርቱን ያዘጋጀው ስምና ፊርማ: ____________________",
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 140, after: 200 },
            children: [
              new TextRun({
                text: "ሪፖርቱን ያፀደቀው ስምና ፊርማ: ____________________",
                bold: true,
                size: 22,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export async function getAnalytics(req, res) {
  try {
    const statusCounts = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const statusData = statusCounts.map(s => ({
      name: s._id.replace("_", " ").toUpperCase(),
      value: s.count
    }));

    const serviceCounts = await Application.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $eq: [{ $type: "$serviceType" }, "string"] },
              "$serviceType",
              "$serviceType.name"
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);
    const serviceData = serviceCounts.map(s => ({
      name: s._id || "General Service",
      value: s.count
    }));

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyCounts = await Application.aggregate([
      { $match: { submittedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$submittedAt" },
            month: { $month: "$submittedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendData = monthlyCounts.map(m => ({
      name: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      applications: m.count
    }));

    res.json({
      statusData,
      serviceData,
      trendData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
