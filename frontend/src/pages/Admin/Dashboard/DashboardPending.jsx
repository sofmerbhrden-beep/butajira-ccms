import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { useAppData } from "@/hooks/useAppData.js";
import { useLanguage } from "@/hooks/useLanguage.js";
import { formatEthDate } from "@/utils/ethDate.js";

export default function DashboardPending() {
  const navigate = useNavigate();
  const { applications } = useAppData();
  const { t } = useLanguage();

  const pending = useMemo(
    () =>
      applications
        .filter((a) => a.status === "admin_review")
        .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)),
    [applications],
  );

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#3C8DBC] mb-1">
        {t("nav_dashboard")}
      </p>
      <h1 className="text-2xl font-bold text-[#212121] mb-6">
        {t("pendingReviewCount", { count: pending.length })}
      </h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-center bg-gray-50">
              <CheckCircle2 size={32} className="mb-3 text-emerald-600" />
              <p className="text-base font-bold text-gray-900 mb-1">{t("nothingWaiting")}</p>
              <p className="text-xs text-gray-500 font-medium">All applications have been reviewed.</p>
            </div>
          ) : (
            pending.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/admin/application/${a.id}`)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 text-left hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <span className="min-w-0">
                  <span className="text-sm font-bold text-gray-900 block truncate group-hover:text-[#3C8DBC]">
                    {a.applicant.fullName}
                  </span>
                  <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                    {a.serviceType?.name} · {t("submitted")} {formatEthDate(a.submittedAt)}
                  </span>
                </span>
                <ChevronRight size={18} className="text-gray-400 shrink-0 group-hover:text-[#3C8DBC] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
