import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../services/api.js";
import { formatEthDate } from "../utils/ethDate.js";
import {
  ShieldCheck,
  ShieldX,
  Loader2,
  Copy,
  Check,
  ArrowLeft,
  Award,
  Calendar,
  User,
  Building2,
  Hash,
  FileCheck2,
} from "lucide-react";

export default function VerifyCertificate() {
  const { year, seq } = useParams();
  const [state, setState] = useState("loading"); // loading | valid | invalid
  const [cert, setCert] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .verifyCertificate(`${seq}/${year}`)
      .then((data) => {
        setCert(data);
        setState("valid");
      })
      .catch(() => setState("invalid"));
  }, [year, seq]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] text-gray-900 font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#3C8DBC] hover:text-[#2a688b] transition-colors bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-500 uppercase bg-slate-200/60 px-3 py-1.5 rounded-lg border border-slate-300/40">
          CCMS Registry Verification
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center my-8">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xl"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="bg-[#1B2A4A] p-6 sm:p-8 text-white relative overflow-hidden flex items-center gap-4 sm:gap-5 border-b border-slate-700/80">
              <img
                src="/logo2.png"
                alt="CCMS Logo"
                className="h-14 sm:h-16 w-auto object-contain shrink-0 drop-shadow-md"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold leading-tight tracking-tight text-white font-sans">
                  Ministry of Communication &amp; Information Technology
                </h1>
                <p className="text-[11px] font-mono tracking-wider uppercase text-slate-300 mt-1">
                  Federal Democratic Republic of Ethiopia
                </p>
                <p className="text-[12px] font-medium text-slate-400 mt-0.5">
                  Competency Certification &amp; Monitoring System (CCMS)
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {state === "loading" && (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-500">
                  <Loader2 size={36} className="animate-spin text-[#3C8DBC]" />
                  <p className="font-medium text-sm text-gray-600">
                    Verifying certificate credentials with CCMS Registry…
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    Ref: {seq}/{year}
                  </p>
                </div>
              )}

              {state === "invalid" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex items-start gap-4">
                    <ShieldX size={36} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-base font-bold text-rose-900">
                        Invalid Certificate Record
                      </h2>
                      <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                        This certificate could not be verified in the official CCMS database. It may be expired, altered, or issued with an invalid reference number.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                        Queried Reference Number
                      </p>
                      <p className="text-sm font-mono font-bold text-gray-800 mt-0.5">
                        {seq}/{year}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-800">
                      Unverified
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 h-10 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copied ? "Link Copied!" : "Copy Verification Link"}</span>
                    </button>
                    <Link
                      to="/"
                      className="flex-1 h-10 bg-[#3C8DBC] hover:bg-[#357ca5] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Return to Portal</span>
                    </Link>
                  </div>
                </motion.div>
              )}

              {state === "valid" && cert && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-4">
                    <ShieldCheck size={36} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-emerald-950">
                          Official Certificate Verified
                        </h2>
                        <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-600 text-white rounded-full">
                          Authentic
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                        This digital certificate has been verified as authentic and officially issued by the Ministry of Communication &amp; Information Technology.
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-4">
                    <DetailRow
                      icon={<Hash size={16} className="text-slate-400" />}
                      label="Reference Number"
                      value={cert.referenceNumber}
                      mono
                      highlight
                    />
                    <DetailRow
                      icon={<User size={16} className="text-slate-400" />}
                      label="Certificate Holder"
                      value={cert.holderName}
                    />
                    {cert.businessName && (
                      <DetailRow
                        icon={<Building2 size={16} className="text-slate-400" />}
                        label="Business Name"
                        value={cert.businessName}
                      />
                    )}
                    <DetailRow
                      icon={<Award size={16} className="text-slate-400" />}
                      label="Service Category"
                      value={cert.serviceType?.name}
                    />
                    <DetailRow
                      icon={<FileCheck2 size={16} className="text-slate-400" />}
                      label="Competency Code"
                      value={cert.serviceType?.code}
                      mono
                    />
                    <DetailRow
                      icon={<Calendar size={16} className="text-slate-400" />}
                      label="Date of Issuance"
                      value={formatEthDate(cert.issuedAt)}
                    />
                    <DetailRow
                      icon={<ShieldCheck size={16} className="text-slate-400" />}
                      label="Issuing Authority"
                      value={cert.adminName || "CCMS System Administrator"}
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 h-10 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                      <span>{copied ? "Link Copied!" : "Copy Verification Link"}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex-1 h-10 bg-[#3C8DBC] hover:bg-[#357ca5] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <span>Print Verification Record</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="text-center py-4">
        <p className="font-mono text-[11px] text-gray-400 tracking-wide">
          © {new Date().getFullYear()} Ministry of Communication &amp; ICT • CCMS Certificate Verification System
        </p>
      </footer>
    </div>
  );
}

function DetailRow({ icon, label, value, mono, highlight }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2.5 shrink-0">
        {icon}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span
        className={`text-xs ${
          mono ? "font-mono font-semibold" : "font-sans font-semibold text-right"
        } ${highlight ? "text-[#3C8DBC] text-sm" : "text-gray-900"}`}
      >
        {value || "-"}
      </span>
    </div>
  );
}
