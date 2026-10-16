import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FileText, Image, ExternalLink, CheckCircle, XCircle, ArrowLeft, User, MapPin, Briefcase, FileCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import AdminStatusPill from "../../components/AdminStatusPill.jsx";
import { useAppData } from "@/hooks/useAppData.js";

const REASONS = [
  "Missing education certificate",
  "Incorrect applicant information",
  "Blurry or unreadable photo",
  "Trade license does not match TIN record",
  "Incomplete supporting documents",
];

function DocViewer({ label, doc }) {
  const [open, setOpen] = useState(false);
  if (!doc?.url) {
    return (
      <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 mb-3 bg-gray-50/50 shadow-xs">
        <div className="h-10 w-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
          <FileText size={18} className="text-gray-400" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
          <p className="text-xs font-medium text-gray-400 mt-0.5">Not uploaded</p>
        </div>
      </div>
    );
  }

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.name || doc.url || "");
  const isPdf = /\.pdf$/i.test(doc.name || doc.url || "");

  return (
    <div className="border border-gray-200/80 rounded-xl mb-3 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-gray-50/80 border-b border-gray-200">
        <div className="flex items-center gap-3 min-w-0">
          {isImage ? <Image size={18} className="text-[#3C8DBC] shrink-0" /> : <FileText size={18} className="text-[#3C8DBC] shrink-0" />}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="text-xs font-bold text-gray-900 truncate mt-0.5">{doc.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setOpen((v) => !v)}
            className="text-xs font-semibold text-gray-700 border border-gray-300 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-100 active:scale-[0.98] transition-all duration-150 shadow-xs cursor-pointer">
            {open ? "Hide" : "Preview"}
          </button>
          <a href={doc.url} target="_blank" rel="noopener noreferrer"
            className="text-xs font-bold text-white bg-[#3C8DBC] hover:bg-[#357ca5] px-3 py-1.5 rounded-lg active:scale-[0.98] transition-all duration-150 shadow-xs flex items-center gap-1 cursor-pointer">
            <ExternalLink size={12} /> Open
          </a>
        </div>
      </div>


      {open && (
        <div className="p-4 bg-gray-50/30">
          {isImage ? (
            <div className="flex justify-center bg-gray-50/50 p-2 rounded-lg border border-gray-200 shadow-inner">
              <img
                src={doc.url}
                alt={doc.name}
                style={{ imageRendering: "high-quality" }}
                className="max-h-[600px] max-w-full w-auto mx-auto object-contain rounded-md border border-gray-200 shadow-md"
              />
            </div>
          ) : isPdf ? (
            <iframe src={doc.url} title={doc.name} className="w-full h-[500px] rounded-lg border border-gray-200 shadow-sm" />
          ) : (
            <div className="flex flex-col items-center py-10 text-gray-500 rounded-lg border border-gray-200 bg-white">
              <FileText size={36} className="mb-3 text-[#3C8DBC]" />
              <p className="text-xs font-semibold text-gray-900">Preview not available for this file type.</p>
              <a href={doc.url} target="_blank" rel="noopener noreferrer"
                className="mt-4 text-xs font-bold text-white bg-[#3C8DBC] hover:bg-[#357ca5] px-3.5 py-2 rounded-lg active:scale-[0.98] transition-all duration-150 flex items-center gap-1 shadow-sm">
                <ExternalLink size={14} /> Open file
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex justify-between items-center gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 shrink-0">{label}</span>
      <span className={`${mono ? "font-mono bg-sky-50 text-[#3C8DBC] px-2 py-0.5 rounded border border-sky-200" : "font-sans"} text-xs font-semibold text-gray-900 text-right`}>{value || "-"}</span>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-md mb-6 overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-3.5 bg-[#1A2226] text-white">
        <Icon size={16} className="text-[#3C8DBC]" />
        <p className="text-xs font-semibold uppercase tracking-wider">{title}</p>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

export default function StaffReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, staffDecide } = useAppData();
  const app = getById(id);

  const [checkedReasons, setCheckedReasons] = useState([]);
  const [otherReason, setOtherReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  if (!app) {
    return (
      <div>
        <p className="text-xs text-gray-500">Application not found.</p>
        <Link to="/staff/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg px-3.5 py-2 hover:bg-gray-50 shadow-sm cursor-pointer"><ArrowLeft size={14} /> Back</Link>
      </div>
    );
  }

  const canDecide = app.status === "staff_review";
  const applicantObj = app.applicant || app.applicantInfo || {};
  const fullName = applicantObj.fullName || applicantObj.name || "Applicant";
  const addr = applicantObj.address || app.applicantInfo?.address || {};

  function toggleReason(r) {
    setCheckedReasons((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
  }

  async function submitReject() {
    const reason = [...checkedReasons, otherReason.trim()].filter(Boolean).join("; ");
    if (!reason) return;
    try {
      await staffDecide(app.id, "rejected", reason);
      navigate("/staff/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function submitApprove() {
    try {
      await staffDecide(app.id, "approved", "");
      navigate("/staff/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="max-w-[860px] mx-auto space-y-5">

      <div className="flex items-center justify-between">
        <Link to="/staff/dashboard"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg px-3.5 py-2 hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 shadow-sm cursor-pointer">
          <ArrowLeft size={14} /> Back
        </Link>
        <AdminStatusPill status={app.status} />
      </div>


      {app.applicationType === "renewal" && (
        <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-4 mb-6 shadow-sm flex items-start gap-4">
          <div className="bg-amber-500 text-white w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs">
            <RefreshCw size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-0.5">
              Renewal Application
            </h2>
            <p className="text-xs text-amber-800 font-medium">
              This application is renewing certificate <strong className="font-bold">{app.renewalOf}</strong>.
              Review any updated details or documents below.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3C8DBC]">Application {app.id}</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{fullName}</h1>
      </div>


      <Section icon={User} title="Applicant Information">
        <InfoRow label="Full Name" value={fullName} />
        <InfoRow label="Gender" value={applicantObj.gender} />
        <InfoRow label="Date of Birth" value={applicantObj.dob} />
        <InfoRow label="Phone" value={applicantObj.phone} mono />
        <InfoRow label="Region" value={addr.region} />
        <InfoRow label="Woreda" value={addr.woreda} />
        <InfoRow label="Kebele" value={addr.kebele} />
        <InfoRow label="House No." value={addr.houseNo} />
        <InfoRow label="P.O. Box" value={addr.poBox} />
        <InfoRow label="Fax" value={addr.fax} />
        <InfoRow label="Email" value={addr.email} />
      </Section>


      <Section icon={Briefcase} title="Business Information">
        {app.hasTradeLicense ? (
          <>
            <InfoRow label="TIN Number" value={app.tin} mono />
            <InfoRow label="Business Name" value={app.businessName} />
          </>
        ) : (
          <InfoRow label="Trade License" value="Not provided" />
        )}
        <InfoRow label="Service" value={app.serviceType?.name} />
        <InfoRow label="Service Code" value={app.serviceType?.code} mono />
      </Section>


      <Section icon={FileCheck} title="Documents">
        <div className="py-2 space-y-3">
          <DocViewer label="Applicant Photo" doc={app.documents?.photo} />
          <DocViewer label="Education Certificate" doc={app.documents?.education} />
          {app.hasTradeLicense && (
            <DocViewer label="Trade License" doc={app.documents?.tradeLicense} />
          )}
          {app.documents?.others?.map((f, i) => (
            <DocViewer key={i} label={`Other document ${i + 1}`} doc={f} />
          ))}
        </div>
      </Section>


      {canDecide && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md mt-8 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-3.5 bg-gray-50 border-b border-gray-200">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-700">Final Review Decision</p>
          </div>
          <div className="p-6">
            {!showReject ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={submitApprove}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#3C8DBC] hover:bg-[#357ca5] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 cursor-pointer">
                  <CheckCircle size={16} /> Approve &amp; Forward to Admin
                </button>
                <button onClick={() => setShowReject(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 cursor-pointer">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-gray-900 mb-4">Select reason(s) for rejection:</p>
                <div className="space-y-3 mb-6">
                  {REASONS.map((r) => (
                    <label key={r} className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" checked={checkedReasons.includes(r)} onChange={() => toggleReason(r)}
                        className="mt-0.5 h-4 w-4 accent-[#3C8DBC] rounded" />
                      <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">{r}</span>
                    </label>
                  ))}
                </div>
                <textarea value={otherReason} onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Other reason (optional)"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4 transition-all shadow-xs" />
                <div className="flex gap-4">
                  <button onClick={submitReject}
                    disabled={checkedReasons.length === 0 && !otherReason.trim()}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    Confirm Rejection
                  </button>
                  <button onClick={() => setShowReject(false)}
                    className="text-xs font-semibold text-gray-700 border border-gray-300 bg-white rounded-lg px-5 py-3 hover:bg-gray-100 active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-xs">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {!canDecide && app.staffNote && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Staff Note</p>
          <p className="text-xs text-gray-900 font-medium">{app.staffNote}</p>
        </div>
      )}
    </div>
  );
}
