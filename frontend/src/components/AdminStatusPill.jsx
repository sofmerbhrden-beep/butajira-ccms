import { useLanguage } from "@/hooks/useLanguage.js";
import { Clock, CheckCircle2, XCircle, FileType } from "lucide-react";

const CATEGORY = {
  draft: "neutral",
  staff_review: "pending",
  admin_review: "pending",
  admin_approved: "pending",
  certificate_generated: "issued",
  staff_rejected: "rejected",
  admin_rejected: "rejected",
  withdrawn: "neutral",
};

const STYLES = {
  pending: { 
    classes: "bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-md shadow-xs", 
    Icon: Clock 
  },
  issued: { 
    classes: "bg-slate-900 text-white border border-slate-800 rounded-lg shadow-md font-bold", 
    Icon: CheckCircle2 
  },
  rejected: { 
    classes: "bg-rose-50 text-rose-700 border-rose-200", 
    Icon: XCircle 
  },
  neutral: { 
    classes: "bg-gray-100 text-gray-700 border-gray-200", 
    Icon: FileType 
  },
};

export default function AdminStatusPill({ status }) {
  const { t } = useLanguage();
  const category = CATEGORY[status] || "neutral";
  const { classes, Icon } = STYLES[category];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold uppercase tracking-wider ${classes}`}
    >
      <Icon size={14} />
      <span>{t(`status_${status}`)}</span>
    </div>
  );
}
