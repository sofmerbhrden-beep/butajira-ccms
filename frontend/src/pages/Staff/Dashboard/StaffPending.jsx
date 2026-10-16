import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { useAppData } from "@/hooks/useAppData.js";
import { formatEthDate } from "@/utils/ethDate.js";

export default function StaffPending() {
  const navigate = useNavigate();
  const { applications } = useAppData();

  const pending = useMemo(() =>
    applications
      .filter((a) => a.status === "staff_review")
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)),
    [applications]
  );

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Dashboard</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
          Pending Review ({pending.length})
        </h1>
        <p className="text-xs text-gray-500 font-medium">Applications assigned for staff evaluation and document verification.</p>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-xl shadow-md p-6">
        <div className="border border-gray-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-gray-500">
              <CheckCircle2 size={32} className="mb-3 text-emerald-500" />
              <p className="text-sm font-bold text-gray-900">Nothing waiting on you.</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">All applications in your queue have been processed.</p>
            </div>
          ) : (
            pending.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/staff/application/${a.id}`)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 text-left hover:bg-sky-50/40 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span className="min-w-0">
                  <span className="text-base font-bold text-gray-900 block truncate">{a.applicant.fullName}</span>
                  <span className="text-xs text-gray-500 font-medium">
                    {a.serviceType?.name} · Submitted {formatEthDate(a.submittedAt)}
                  </span>
                </span>
                <ChevronRight size={18} className="text-[#3C8DBC] shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
