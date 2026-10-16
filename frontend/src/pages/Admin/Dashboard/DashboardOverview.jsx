import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, Award, XCircle, ArrowRight, ArrowUpRight } from "lucide-react";
import { useAppData } from "@/hooks/useAppData.js";
import { useLanguage } from "@/hooks/useLanguage.js";
import { formatEthDate } from "@/utils/ethDate.js";
import AdminStatusPill from "../../../components/AdminStatusPill.jsx";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../../components/ui/select.jsx";

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { applications } = useAppData();
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(null);

  const counts = useMemo(() => {
    const today = new Date().toDateString();
    return {
      today: applications.filter((a) => new Date(a.submittedAt).toDateString() === today).length,
      pending: applications.filter((a) => a.status === "admin_review").length,
      issued: applications.filter((a) => a.status === "certificate_generated").length,
      rejected: applications.filter((a) => a.status.endsWith("rejected")).length,
    };
  }, [applications]);

  const recent = useMemo(
    () => [...applications].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5),
    [applications],
  );

  useEffect(() => {
    if (!selectedId && recent.length > 0) setSelectedId(recent[0].id);
  }, [recent, selectedId]);

  const selected = recent.find((a) => a.id === selectedId) || recent[0] || null;

  const stats = [
    { label: t("stat_appsToday"), value: counts.today, Icon: CalendarDays },
    { label: t("stat_pendingMyReview"), value: counts.pending, Icon: Clock },
    { label: t("stat_certsIssued"), value: counts.issued, Icon: Award },
    { label: t("stat_rejected"), value: counts.rejected, Icon: XCircle },
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
            {t("adminDashboardTitle")}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-lg mx-auto leading-relaxed">
            System administration analytics decision oversight and certificate issuance control
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3 pb-3 border-b border-slate-200">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            {t("recentApplications")}
          </p>
          <button
            onClick={() => navigate("/admin/application")}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#3C8DBC] hover:text-[#357ca5] transition-colors cursor-pointer uppercase tracking-wider"
          >
            {t("viewAll")} <ArrowRight size={14} />
          </button>
        </div>

        {recent.length === 0 || !selected ? (
          <div className="flex flex-col items-center py-14 text-gray-400 border border-dashed border-gray-200 rounded-lg">
            <p className="text-sm font-medium">{t("noApplicationsYet2")}</p>
          </div>
        ) : (
          <>
            <Select value={selected.id} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full sm:w-80 mb-5 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold text-xs focus:ring-2 focus:ring-[#3C8DBC]">
                <SelectValue placeholder={t("col_applicant")} />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg">
                {recent.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-xs font-medium text-gray-800 focus:bg-[#3C8DBC] focus:text-white">
                    {a.applicant.fullName} ({a.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50">
              <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {selected.applicant.fullName}
                  </p>
                  <p className="text-xs font-mono text-gray-500 mt-0.5">{selected.id}</p>
                </div>
                <AdminStatusPill status={selected.status} variant="light" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-5">
                <Field label={t("col_service")} value={selected.serviceType?.name || "-"} />
                <Field label={t("col_submitted")} value={formatEthDate(selected.submittedAt)} />
                <Field label={t("col_refNo")} value={selected.certificate?.referenceNumber || "-"} mono />
                <Field label={t("phone")} value={selected.applicant.phone || "-"} />
              </div>

              <button
                onClick={() => navigate(`/admin/application/${selected.id}`)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3C8DBC] hover:underline cursor-pointer"
              >
                Open full record <ArrowUpRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </p>
      <p className={`text-sm text-gray-900 font-semibold ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}
