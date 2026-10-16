import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, ChevronLeft, Search, Inbox } from "lucide-react";
import { useAppData } from "@/hooks/useAppData.js";
import AdminStatusPill from "../../../components/AdminStatusPill.jsx";
import { formatEthDate } from "@/utils/ethDate.js";

const PAGE_SIZE = 8;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "staff_review", label: "Awaiting Review" },
  { key: "admin_review", label: "Forwarded" },
  { key: "staff_rejected", label: "Rejected" },
];

export default function StaffApplicationsIndex() {
  const navigate = useNavigate();
  const { applications } = useAppData();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "new", "renewal"


  const urlStatus = searchParams.get("status");
  const filter = urlStatus || "all";
  const activeLabel = FILTERS.find((f) => f.key === filter)?.label || "All";

  const rows = useMemo(() => {
    let list = filter === "all" ? applications : applications.filter((a) => a.status === filter);
    
    if (typeFilter !== "all") {
      list = list.filter((a) => a.applicationType === typeFilter);
    }
    
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
  }, [applications, filter, typeFilter, query]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  useEffect(() => { setPage(1); }, [filter, query]);
  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [rows, currentPage]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#3C8DBC] mb-1">Staff Records</p>
      <h1 className="text-2xl font-bold text-[#212121] mb-6">Applications Index</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">Search & Filter</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, phone, service…"
              className="w-full h-10 border border-gray-300 bg-white rounded-lg pl-9 pr-4 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] transition-all shadow-xs" />
          </div>
          
          <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50/50 h-10 w-max shadow-xs">
            {["all", "new", "renewal"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                  typeFilter === type ? "bg-[#3C8DBC] text-white shadow-sm" : "text-gray-700 hover:bg-gray-200/60"
                }`}
              >
                {type === "all" ? "All Types" : type === "new" ? "New" : "Renewal"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">

        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center bg-[#1E293B] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-sm">
            {activeLabel}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
            {rows.length} result{rows.length !== 1 ? "s" : ""}
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Inbox size={36} className="mb-3 text-gray-400" />
            <p className="text-sm font-semibold">No applications match this view.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm">
            <div className="hidden lg:grid grid-cols-[1fr_180px_110px_160px_60px] gap-4 px-6 py-3.5 bg-[#1A2226] text-white text-xs font-semibold uppercase tracking-wider">
              <span>Applicant</span>
              <span>Service</span>
              <span>Submitted</span>
              <span>Status</span>
              <span />
            </div>
            {pagedRows.map((a) => (
              <button key={a.id} onClick={() => navigate(`/staff/application/${a.id}`)}
                className="w-full grid grid-cols-1 lg:grid-cols-[1fr_180px_110px_160px_60px] gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 items-center text-left hover:bg-sky-50/40 active:scale-[0.995] transition-all duration-150 cursor-pointer group">
                <span>
                  <span className="text-sm font-bold text-gray-900 block truncate group-hover:text-[#3C8DBC] transition-colors">{a.applicant.fullName}</span>
                  <span className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-gray-400">{a.id}</span>
                    {a.applicationType === "renewal" ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">↻ Renewal</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-sky-50 text-[#3C8DBC] border border-sky-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">★ New</span>
                    )}
                  </span>
                </span>
                <span className="text-xs text-gray-600 font-medium truncate">{a.serviceType?.name || "-"}</span>
                <span className="text-xs text-gray-500 font-medium">{formatEthDate(a.submittedAt)}</span>
                <AdminStatusPill status={a.status} />
                <span className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 group-hover:text-[#3C8DBC] group-hover:border-[#3C8DBC] group-hover:shadow-sm transition-all">
                  <ChevronRight size={16} />
                </span>
              </button>
            ))}
          </div>
        )}

        {rows.length > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-4 bg-white rounded-xl border border-gray-200 px-6 py-4 mt-6 shadow-sm">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg px-3.5 py-2 hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 shadow-xs disabled:opacity-50 cursor-pointer">
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg px-3.5 py-2 hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 shadow-xs disabled:opacity-50 cursor-pointer">
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
