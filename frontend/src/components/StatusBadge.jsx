import { useLanguage } from "@/hooks/useLanguage.js";

const STYLES = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  staff_review: "bg-amber-50 text-amber-800 border-amber-200",
  staff_rejected: "bg-rose-50 text-rose-700 border-rose-200",
  admin_review: "bg-sky-50 text-[#3C8DBC] border-sky-200",
  admin_rejected: "bg-rose-50 text-rose-700 border-rose-200",
  admin_approved: "bg-indigo-50 text-indigo-700 border-indigo-200",
  certificate_generated: "bg-[#1E293B] text-white border-[#1E293B]",
  withdrawn: "bg-gray-100 text-gray-400 border-gray-200 line-through",
};

export default function StatusBadge({ status }) {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-md px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] uppercase ${
        STYLES[status] || "bg-gray-100 text-gray-600 border-gray-300"
      }`}
    >
      {t(`status_${status}`)}
    </span>
  );
}
