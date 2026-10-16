import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatEthDate, formatEthDateNumeric } from "../utils/ethDate.js";

export default function CertificatePreview({ app, selectedYear }) {
  if (!app.certificate) return null;

  const addr = app.applicant.address || {};
  const licenseeName = app.hasTradeLicense
    ? app.businessName || app.applicant.fullName
    : app.applicant.fullName;

  const defaultFullAddress =
    app.applicant?.address?.licenseOwnerAddress ||
    [addr.region, addr.woreda, addr.kebele].filter(Boolean).map((s) => String(s).trim()).join("/") ||
    "";
  const [editableAddress, setEditableAddress] = useState(defaultFullAddress);
  const [seq, baseYear] = String(app.certificate.referenceNumber).split("/");


  const history = app.certificate.history || {};
  const displayYear = selectedYear || app.certificate.latestYear || baseYear;
  const yearEntry = history[String(displayYear)] || {};
  const issuedAt = yearEntry.issuedAt || app.certificate.issuedAt;

  const verifyUrl = `${window.location.origin}/verify/${displayYear}/${seq}`;

  return (
    <div className="border-4 border-cyan-700 bg-paper-card text-black w-full max-w-[794px] mx-auto">
      {" "}

      <div className="mx-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-2 pb-3">
        <p className="text-[13px] font-serif leading-snug text-left min-w-0">
          በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ
          <br />
          የመገናኛና እንፎርሜሽን ቴክኖሎጅ ሚኒስቴር
        </p>
        <img src="/logo2.png" alt="" className="h-20 w-20 object-contain" />
        <p className="text-[13px] font-serif leading-snug text-right min-w-0">
          The Federal Democratic Republic of Ethiopia<br />
          Ministry of Communication &amp; Information Technology
        </p>
      </div>
      <hr className="border-gray-400 mx-6" />

      <div className="flex justify-center my-4">
        <p className="border-b border-dashed border-gray-500 text-center w-[600px] pb-1 text-[15px]">
          {app.serviceType?.nameAm || "-"}
          {app.serviceType?.code ? ` (${app.serviceType.code})` : ""}
        </p>
      </div>

      <div className="flex gap-6 w-full my-2 py-3 px-3">

        <div className="shrink-0 ml-[7.5%]">
          <div className="h-44 w-36 border-2 border-gray-700 overflow-hidden flex items-center justify-center bg-paper-card">
            {app.documents?.photo?.url ? (
              <img
                src={app.documents.photo.url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-400 text-center px-2">
                Photo
              </span>
            )}
          </div>
        </div>

        <div className="ml-auto w-[55%] space-y-1 text-[14px]">
          <Row
            amLabel="የግብር ከፋይ መለያ ቁጥር"
            enLabel="TIN"
            value={app.tin || "-"}
          />
          <Row
            amLabel="የብቃት ማረጋገጫ ቁጥር"
            enLabel="Competency No."
            value={app.serviceType?.code || "-"}
          />
          <Row
            amLabel="ፈቃድ የተሰጠበት ቀን"
            enLabel="Date of Issuance"
            value={formatEthDateNumeric(issuedAt)}
          />
          <Row
            amLabel="ቁጥር፡-ደኢ/መ/ኤ/ቴ/ኤ/"
            enLabel="Reference"
            value={app.certificate.referenceNumber}
          />
        </div>
      </div>

      <div className="mx-auto w-[85%] my-4 space-y-1 text-[14px]">
        <Row
          num="1."
          amLabel="የባለ ፈቃዱ ስም"
          enLabel="Name of the License"
          value={licenseeName}
        />
        <EditableRow
          num="2."
          amLabel="የአመልካች አድራሻ"
          enLabel="Applicant Address"
          value={editableAddress}
          onChange={setEditableAddress}
        />
        <BulletRow
          amLabel="ክልል"
          enLabel="Region"
          value={addr.region || "-"}
          indent="ml-8"
        />
        <BulletRow
          amLabel="ወረዳ"
          enLabel="Woreda"
          value={addr.woreda || "-"}
          indent="ml-8"
        />
        <BulletRow
          amLabel="ቀበሌ"
          enLabel="Kebele"
          value={addr.kebele || "-"}
          indent="ml-8"
        />
        <BulletRow
          amLabel="ሰልክ ቁጥር"
          enLabel="Telephone"
          value={app.applicant.phone || "-"}
          indent="ml-8"
        />
        <BulletRow
          amLabel="ፖ.ሣ.ቁ"
          enLabel="P.O.Box"
          value={addr.poBox || "-"}
          indent="ml-8"
        />
        <BulletRow
          amLabel="ፋክስ"
          enLabel="Fax"
          value={addr.fax || "-"}
          indent="ml-8"
        />
        <BulletRow
          amLabel="ኢ-ሜይል"
          enLabel="E-mail"
          value={addr.email || "-"}
          indent="ml-8"
        />

        <div className="my-1 p-1 flex items-start justify-between text-[14px]">

          <div className="ml-8 flex items-end gap-1">
            <span className="shrink-0 text-[14px]">ለ</span>
            <div className="flex flex-col items-center">
              <span
                contentEditable
                suppressContentEditableWarning
                style={{ outline: "none", minWidth: "3rem" }}
                className="text-center w-16 text-[13px] text-gray-400 cursor-text print:cursor-default print:text-black"
              >
                {String(displayYear)}
              </span>
              <span
                style={{ borderTop: "1.5px dashed #555" }}
                className="w-16 block"
              />
            </div>
            <span className="shrink-0 text-[14px]">
              {app.applicationType === "renewal" ? "ዓ.ም ታድሷል" : "ዓ.ም"}
            </span>
          </div>

          <div className="text-center">
            <span
              contentEditable
              suppressContentEditableWarning
              style={{
                borderBottom: "1.5px dashed #555",
                outline: "none",
                minWidth: "8rem",
              }}
              className="inline-block text-center w-36 cursor-text print:cursor-default"
            >
              {""}
            </span>
            <p className="text-[13px] mt-0.5">የኃላፊው ስምና ፊርማ</p>
            <p className="text-[11px] text-gray-500">
              Official Name and Signature
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex-1 text-[11px] text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900 mb-1">
            ይህ ፈቃድ በቴሌኮሙኒኬሽን አዋጅ ቁጥር 49/1889 (እንደተሸሻለው) አንቀጽ 10 ንዑስ አንቀጽ 4 መሠረት
            በወጣው የቴሌኮሙኒኬሽን ሪሴል አገልግሎት እና የቴሌ ሴንተር ፈቃድ መመሪያ ቁጥር 1/1995 መሠረት የተሰጠ፡፡
          </p>
          <p className="text-slate-500 font-medium text-[10px] leading-snug">
            This license is issued as per the Directive on resale and Telecenter
            in Telecommunication No1/2002 that is issued on the basis of Article
            10 sub-Article 4 of Telecommunication Proclamation No 49/1996 (as
            amended).
          </p>
        </div>
        <div className="shrink-0 p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <QRCodeSVG value={verifyUrl} size={60} level="M" />
        </div>
      </div>
    </div>
  );
}

function EditableRow({ amLabel, enLabel, value, onChange, num }) {
  return (
    <div className="my-1 p-1">
      <div className="flex items-baseline gap-1">
        {num && <span className="shrink-0 font-medium">{num}</span>}
        <span className="shrink-0 font-medium">{amLabel}:</span>
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange(e.currentTarget.textContent)}
          style={{
            borderBottom: "1.5px dashed #555",
            outline: "none",
            minWidth: "4rem",
          }}
          className="text-center w-1/2 cursor-text print:cursor-default"
        >
          {value}
        </span>
      </div>
      <p className="text-[11px] text-gray-500 ml-1">{enLabel}</p>
    </div>
  );
}

function Row({ amLabel, enLabel, value, num }) {
  const missing = !value || value === "-";
  return (
    <div className="my-1 p-1">
      <div className="flex items-baseline gap-1">
        {num && <span className="shrink-0 font-medium">{num}</span>}
        <span className="shrink-0 font-medium">{amLabel}:</span>
        <span
          contentEditable={missing}
          suppressContentEditableWarning
          style={{ borderBottom: "1.5px dashed #555", outline: "none", minWidth: "4rem" }}
          className={`text-center w-1/2 ${missing ? "cursor-text text-gray-400 print:text-black print:cursor-default" : ""}`}
        >
          {missing ? "" : value}
        </span>
      </div>
      <p className="text-[11px] text-gray-500 ml-1">{enLabel}</p>
    </div>
  );
}

function BulletRow({ amLabel, enLabel, value, indent = "ml-4" }) {
  const missing = !value || value === "-";
  return (
    <div className={`my-1 p-1 ${indent}`}>
      <div className="flex items-baseline gap-1">
        <span className="shrink-0 text-gray-600">•</span>
        <span className="shrink-0 font-medium">{amLabel}:</span>
        <span
          contentEditable={missing}
          suppressContentEditableWarning
          style={{ borderBottom: "1.5px dashed #555", outline: "none", minWidth: "4rem" }}
          className={`text-center w-1/2 ${missing ? "cursor-text text-gray-400 print:text-black print:cursor-default" : ""}`}
        >
          {missing ? "" : value}
        </span>
      </div>
      <p className="text-[11px] text-gray-500 ml-4">{enLabel}</p>
    </div>
  );
}
