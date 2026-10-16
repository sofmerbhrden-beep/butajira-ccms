import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Clock, CheckCircle, XCircle, List } from "lucide-react";
import AdminStatusPill from "../../components/AdminStatusPill.jsx";
import { useAppData } from "@/hooks/useAppData.js";
import { formatEthDate } from "@/utils/ethDate.js";

const FILTERS = [
  { key: "all", label: "All", Icon: List },
  { key: "staff_review", label: "Awaiting Review", Icon: Clock },
  { key: "admin_review", label: "Forwarded", Icon: CheckCircle },
  { key: "staff_rejected", label: "Rejected", Icon: XCircle },
];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { applications } = useAppData();
  const [filter, setFilter] = useState("staff_review");
  const [query, setQuery] = useState("");

  const counts = {
    all: applications.length,
    staff_review: applications.filter((a) => a.status === "staff_review").length,
    approved: applications.filter((a) => a.status === "admin_review").length,
    staff_rejected: applications.filter((a) => a.status === "staff_rejected").length,
  };

  const rows = useMemo(() => {
    let list = filter === "all" ? applications : applications.filter((a) => a.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.applicant.fullName.toLowerCase().includes(q) ||
          a.applicant.phone?.includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.serviceType?.name.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [applications, filter, query]);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3C8DBC] mb-1">
            Front Desk Portal
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Applications Queue
          </h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto">
          {FILTERS.map((f) => {
            const count = counts[f.key];
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`relative text-left bg-[#1B2A4A] text-white border rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all cursor-pointer min-w-[120px] ${
                  isActive ? "border-[#38bfd8] bg-[#22355c] translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]" : "border-slate-700 hover:border-slate-500 hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xl font-black text-white font-mono">{count}</p>
                  <f.Icon size={18} className={isActive ? "text-[#38bfd8]" : "text-slate-400"} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{f.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-md overflow-hidden relative">
        <div className="flex items-center justify-between flex-wrap gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                  filter === f.key
                    ? "bg-[#3C8DBC] text-white shadow-md hover:bg-[#357ca5]"
                    : "bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50"
                }`}>
                <f.Icon size={14} />
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, service…"
              className="bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-gray-900 placeholder:text-gray-400 w-64 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] transition-all" />
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-[1fr_180px_130px_160px_80px] gap-4 px-6 py-3.5 bg-[#1A2226] text-white text-xs font-semibold uppercase tracking-wider">
          <span>Applicant</span>
          <span>Service</span>
          <span>Submitted</span>
          <span>Status</span>
          <span />
        </div>

        {rows.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm font-medium text-gray-500">
            No applications match this view.
          </p>
        ) : (
          rows.map((a) => (
            <button key={a.id} onClick={() => navigate(`/staff/application/${a.id}`)}
              className="w-full grid grid-cols-1 lg:grid-cols-[1fr_180px_130px_160px_80px] gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 items-center text-left hover:bg-sky-50/40 active:scale-[0.995] transition-all duration-150 cursor-pointer group">
              <span>
                <span className="text-sm font-bold text-gray-900 block">{a.applicant.fullName}</span>
                <span className="text-xs text-gray-400 font-mono">{a.id}</span>
              </span>
              <span className="text-xs text-gray-600 font-medium truncate">{a.serviceType?.name || "-"}</span>
              <span className="text-xs text-gray-500 font-medium">
                {formatEthDate(a.submittedAt)}
              </span>
              <AdminStatusPill status={a.status} />
              <span className="text-xs font-bold text-[#3C8DBC] uppercase tracking-wider group-hover:translate-x-1 transition-transform">Review →</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
