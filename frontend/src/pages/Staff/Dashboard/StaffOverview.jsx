import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, FileText, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppData } from "@/hooks/useAppData.js";
import AdminStatusPill from "../../../components/AdminStatusPill.jsx";
import { formatEthDate } from "@/utils/ethDate.js";

export default function StaffOverview() {
  const navigate = useNavigate();
  const { applications } = useAppData();

  const counts = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((a) => a.status === "staff_review").length,
    forwarded: applications.filter((a) => a.status === "admin_review").length,
    rejected: applications.filter((a) => a.status === "staff_rejected").length,
  }), [applications]);

  const PAGE_SIZE = 5;
  const [page, setPage] = useState(0);

  const recentAll = useMemo(() =>
    [...applications].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    [applications]
  );

  const totalPages = Math.ceil(recentAll.length / PAGE_SIZE);
  const recent = recentAll.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const stats = [
    { label: "Total Applications", value: counts.total, Icon: FileText },
    { label: "Awaiting Review", value: counts.pending, Icon: Clock },
    { label: "Forwarded to Admin", value: counts.forwarded, Icon: CheckCircle },
    { label: "Rejected", value: counts.rejected, Icon: XCircle },
  ];

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-[#1B2A4A] to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden text-center flex flex-col items-center justify-center">
        <img
          src="/logo2.png"
          alt="Government Seal"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-[0.35] pointer-events-none select-none object-contain filter drop-shadow-2xl"
        />
        <div className="relative z-10 max-w-xl mx-auto space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Staff Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-lg mx-auto leading-relaxed">
            Review applicant submissions verify credentials and process competency certification requests
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[#1B2A4A] text-white border border-slate-700 rounded-none p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-3xl font-extrabold text-white font-mono tracking-tight">{s.value}</p>
              <div className="p-2.5 rounded-none bg-white/10 text-white flex items-center justify-center">
                <s.Icon size={18} strokeWidth={2} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200/80 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold font-mono text-slate-900">Recent Applications</h2>
            <p className="text-xs text-gray-500 font-medium">Overview of the latest submissions across all service categories.</p>
          </div>
          <button
            onClick={() => navigate("/staff/applications")}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#3C8DBC] hover:text-[#357ca5] transition-colors cursor-pointer uppercase tracking-wider"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        {recentAll.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-xl">
            <p className="text-xs font-semibold">No applications found in the registry.</p>
          </div>
        ) : (
          <>
            <div className="border border-gray-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
              {recent.map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/staff/application/${a.id}`)}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-gray-100 last:border-b-0 text-left hover:bg-sky-50/40 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-base font-bold text-gray-900 block mb-0.5">{a.applicant.fullName}</span>
                    <span className="text-xs text-gray-500 font-medium">{a.serviceType?.name} · {formatEthDate(a.submittedAt)}</span>
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <AdminStatusPill status={a.status} />
                    <ArrowUpRight size={16} className="text-gray-400 group-hover:text-gray-600 hidden sm:block" />
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-5 px-1">
              <span className="text-xs font-semibold text-gray-500">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, recentAll.length)} of {recentAll.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 bg-white text-xs text-gray-700 font-bold rounded-lg shadow-xs hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 bg-white text-xs text-gray-700 font-bold rounded-lg shadow-xs hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
