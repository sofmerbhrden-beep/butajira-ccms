import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, ChevronLeft, Inbox, Search } from "lucide-react";
import { useAppData } from "@/hooks/useAppData.js";
import AdminStatusPill from "../../../components/AdminStatusPill.jsx";
import { formatEthDate } from "@/utils/ethDate.js";
import ImportLegacyModal from "./ImportLegacyModal.jsx";

const PAGE_SIZE = 5;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "staff_review", label: "Pending Staff" },
  { key: "admin_review", label: "Pending Admin" },
  { key: "certificate_generated", label: "Issued" },
  { key: "rejected", label: "Rejected" },
];

const BTN_BASE =
  "inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3C8DBC] focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm";
const BTN_ACTIVE = "bg-[#3C8DBC] text-white border-[#3C8DBC] shadow-md hover:bg-[#357ca5]";
const BTN_OUTLINE =
  "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:shadow-md hover:border-gray-400 disabled:hover:border-gray-300 disabled:hover:bg-white";
const BTN_NAV =
  "bg-[#3C8DBC] text-white border-[#3C8DBC] hover:bg-[#357ca5] shadow-md hover:shadow-lg disabled:hover:bg-[#3C8DBC]";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function ApplicationsIndex() {
  const navigate = useNavigate();
  const { applications } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showLegacyModal, setShowLegacyModal] = useState(false);

  const filter = searchParams.get("status") || "all";

  function setFilter(key) {
    if (key === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ status: key });
    }
  }

  const rows = useMemo(() => {
    let list;
    if (filter === "all") {
      list = applications;
    } else if (filter === "rejected") {
      list = applications.filter((a) => a.status.endsWith("rejected"));
    } else {
      list = applications.filter((a) => a.status === filter);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.applicant.fullName.toLowerCase().includes(q) ||
          a.certificate?.referenceNumber?.toLowerCase().includes(q),
      );
    }
    return [...list].sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
    );
  }, [applications, filter, query]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(
    () => rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [rows, currentPage],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3C8DBC] mb-1">
            All records
          </p>
          <h1 className="text-2xl font-bold text-[#212121]">
            Applications
          </h1>
        </div>
        <button
          onClick={() => setShowLegacyModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          + Import Paper Certificate
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        {filter !== "all" && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Filtering by
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#3C8DBC]/10 text-[#3C8DBC] font-semibold text-xs border border-[#3C8DBC]/20">
              {FILTERS.find((f) => f.key === filter)?.label || filter}
            </span>
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Search
        </p>
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or reference no."
            className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {rows.length} {rows.length === 1 ? "result" : "results"}
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            <Inbox size={32} className="mb-3 text-gray-400" />
            <p className="font-semibold text-sm">
              No applications match this view.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[1.5fr_1.5fr_100px_100px_160px_40px] gap-4 px-6 py-3 bg-[#1A2226] text-white text-xs font-semibold uppercase tracking-wider">
                <span>Applicant</span>
                <span>Service</span>
                <span>Submitted</span>
                <span>Ref. No.</span>
                <span>Status</span>
                <span />
              </div>

              {pagedRows.map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/admin/application/${a.id}`)}
                  className="w-full grid grid-cols-[1.5fr_1.5fr_100px_100px_160px_40px] gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 items-center text-left hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <span>
                    <span className="text-sm font-semibold text-gray-900 block truncate group-hover:text-[#3C8DBC]">
                      {a.applicant.fullName}
                    </span>
                    <span className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-gray-400">{a.id}</span>
                      {a.applicationType === "renewal" ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[10px] uppercase px-1.5 py-0.5 rounded">↻ Renewal</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px] uppercase px-1.5 py-0.5 rounded">★ New</span>
                      )}
                    </span>
                  </span>
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {a.serviceType?.name}
                  </span>
                  <span className="text-xs font-mono text-gray-500 whitespace-nowrap">
                    {formatEthDate(a.submittedAt)}
                  </span>
                  <span className="text-xs font-mono text-gray-700 whitespace-nowrap">
                    {a.certificate?.referenceNumber || "-"}
                  </span>
                  <AdminStatusPill status={a.status} />
                  <span className="flex justify-end">
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-[#3C8DBC] group-hover:translate-x-0.5 transition-all" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {rows.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-2 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Page</span>
              <select
                value={currentPage}
                onChange={(e) => setPage(Number(e.target.value))}
                className="h-8 border border-gray-300 rounded-md text-xs px-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#3C8DBC]"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ),
                )}
              </select>
              <span className="text-xs text-gray-500 font-medium">of {totalPages}</span>
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#3C8DBC] hover:bg-[#357ca5] text-white px-3 py-2 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {showLegacyModal && (
        <ImportLegacyModal onClose={() => setShowLegacyModal(false)} />
      )}
    </div>
  );
}
