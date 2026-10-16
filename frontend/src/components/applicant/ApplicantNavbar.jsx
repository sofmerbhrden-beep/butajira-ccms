import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  ChevronRight,
  CheckCheck,
  Inbox,
  Mail,
} from "lucide-react";
import { Button } from "../ui/button.jsx";
import LanguageToggle from "../LanguageToggle.jsx";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu.jsx";
import { useAppData } from "@/hooks/useAppData.js";
import { useLanguage } from "@/hooks/useLanguage.js";
import { useAuth } from "@/hooks/useAuth.js";
import { formatEthRelative, formatEthDateTime } from "@/utils/ethDate.js";

const NOTIF_STATUSES = [
  "staff_review",
  "admin_review",
  "admin_approved",
  "certificate_generated",
  "staff_rejected",
  "admin_rejected",
];

const STATUS_META = {
  staff_review: {
    color: "bg-amber-400",
    dot: "bg-amber-400",
    label: { en: "Pending Staff Review", am: "በሰራተኛ ግምገማ ላይ" },
  },
  admin_review: {
    color: "bg-blue-400",
    dot: "bg-blue-400",
    label: { en: "Now Pending Admin Review", am: "አሁን በአስተዳዳሪ ግምገማ ላይ" },
  },
  admin_approved: {
    color: "bg-emerald-400",
    dot: "bg-emerald-400",
    label: {
      en: "Approved  Certificate Being Prepared",
      am: "ጸድቋል  የምስክር ወረቀት እየተዘጋጀ ነው",
    },
  },
  certificate_generated: {
    color: "bg-emerald-500",
    dot: "bg-emerald-500",
    label: { en: "Certificate Issued ✓", am: "የምስክር ወረቀት ተሰጥቷል ✓" },
  },
  staff_rejected: {
    color: "bg-red-500",
    dot: "bg-red-500",
    label: { en: "Rejected by Staff", am: "በሰራተኛ ተቀባይነት አላገኘም" },
  },
  admin_rejected: {
    color: "bg-red-600",
    dot: "bg-red-600",
    label: { en: "Rejected by Admin", am: "በአስተዳዳሪ ተቀባይነት አላገኘም" },
  },
};

function bodyText(status, lang, app) {
  const reason =
    app?.staffDecision?.reason || app?.adminDecision?.reason || null;
  const msgs = {
    staff_review: {
      en: "Your application has been submitted and is waiting for staff review.",
      am: "ማመልከቻዎ ገብቷል እና በሰራተኛ ግምገማ ላይ ይጠብቃል።",
    },
    admin_review: {
      en: "Staff approved your application. It is now under admin review.",
      am: "ሰራተኛ ማመልከቻዎን አጽድቋል። አሁን በአስተዳዳሪ ግምገማ ላይ ነው።",
    },
    admin_approved: {
      en: "Admin approved your application. Your certificate is being prepared.",
      am: "አስተዳዳሪ ማመልከቻዎን አጽድቋል። የምስክር ወረቀትዎ እየተዘጋጀ ነው።",
    },
    certificate_generated: {
      en: "Your certificate has been issued. Check your email for the PDF.",
      am: "የምስክር ወረቀትዎ ተሰጥቷል። PDF ለማግኘት ኢሜይልዎን ያረጋግጡ።",
    },
    staff_rejected: {
      en: reason
        ? `Rejected by staff. Reason: ${reason}`
        : "Your application was rejected by staff.",
      am: reason
        ? `በሰራተኛ ተቀባይነት አላገኘም። ምክንያት: ${reason}`
        : "ማመልከቻዎ በሰራተኛ ተቀባይነት አላገኘም።",
    },
    admin_rejected: {
      en: reason
        ? `Rejected by admin. Reason: ${reason}`
        : "Your application was rejected by admin.",
      am: reason
        ? `በአስተዳዳሪ ተቀባይነት አላገኘም። ምክንያት: ${reason}`
        : "ማመልከቻዎ በአስተዳዳሪ ተቀባይነት አላገኘም።",
    },
  };
  return msgs[status]?.[lang] ?? msgs[status]?.en ?? "";
}

const emailReminder = {
  en: "📧 Check your email  details have been sent to your registered address.",
  am: "📧 ኢሜይልዎን ያረጋግጡ  ዝርዝሩ ወደ ተመዘገበው አድራሻዎ ተልኳል።",
};

export default function ApplicantNavbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { applications } = useAppData();
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const [profilePhoto, setProfilePhoto] = useState(() => {
    if (!user?.username) return null;
    return localStorage.getItem(`profile_photo_${user.username}`);
  });

  useEffect(() => {
    const handleUpdate = () => {
      if (user?.username) {
        setProfilePhoto(localStorage.getItem(`profile_photo_${user.username}`));
      }
    };
    handleUpdate();
    window.addEventListener("profile_photo_updated", handleUpdate);
    return () => window.removeEventListener("profile_photo_updated", handleUpdate);
  }, [user]);

  const updates = applications
    .filter((a) => NOTIF_STATUSES.includes(a.status))
    .sort((a, b) => {
      const aAt = a.adminDecision?.at ?? a.staffDecision?.at ?? a.submittedAt;
      const bAt = b.adminDecision?.at ?? b.staffDecision?.at ?? b.submittedAt;
      return new Date(bAt) - new Date(aAt);
    });

  const [readIds, setReadIds] = useState(() => new Set());

  useEffect(() => {
    setReadIds((prev) => {
      const validIds = new Set(updates.map((a) => a.id));
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [applications]);

  const unreadCount = updates.filter((a) => !readIds.has(a.id)).length;

  function markAllRead() {
    setReadIds(new Set(updates.map((a) => a.id)));
  }
  function open(id) {
    setReadIds((p) => new Set(p).add(id));
    navigate("/applicant/dashboard");
  }

  const needsEmailReminder = (s) =>
    [
      "certificate_generated",
      "staff_rejected",
      "admin_rejected",
      "admin_approved",
    ].includes(s);

  return (
    <header className="h-14 sm:h-20 shrink-0 bg-[#3C8DBC] text-white flex items-center justify-between px-3 sm:px-4 z-50 relative">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-white hover:bg-black/10 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} strokeWidth={2} />
        </Button>
        <div className="flex items-center gap-3">
          <img src="/logo2.png" alt="Logo" className="h-11 sm:h-12 w-auto object-contain shrink-0" />
          <span className="hidden sm:inline font-mono text-[13px] tracking-[0.08em] uppercase text-white font-bold">
            {t("role_applicant")} {t("portalSuffix")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-white hover:bg-black/10 transition-colors cursor-pointer"
              aria-label="Inbox"
            >
              <Bell size={20} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-mono flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.08)" }}
            className="w-[calc(100vw-16px)] max-w-[400px] p-0 overflow-hidden rounded-xl bg-white text-gray-900 z-50 border border-gray-200"
          >
            <div className="flex items-center justify-between px-4 py-3 text-white bg-[#1B2A4A]">
              <div className="flex items-center gap-2.5">
                <Bell size={16} strokeWidth={2} />
                <p className="font-mono text-[13px] font-bold uppercase tracking-wide">
                  {lang === "am" ? "ማሳወቂያዎች" : "NOTIFICATIONS"}
                  {updates.length > 0 && (
                    <span className="ml-1.5 text-gray-400 font-normal text-xs">
                      ({updates.length})
                    </span>
                  )}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-cyan-400 hover:underline cursor-pointer border-none bg-transparent"
                >
                  {lang === "am" ? "ሁሉንም አንብብ" : "Mark Read"}
                </button>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto bg-gray-50">
              {updates.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-gray-500">
                  <Inbox size={36} className="text-gray-300 mb-2" strokeWidth={1.5} />
                  <p className="text-xs font-semibold">
                    {lang === "am" ? "ምንም ማሳወቂያ የለም" : "No notifications"}
                  </p>
                </div>
              ) : (
                updates.map((a) => {
                  const unread = !readIds.has(a.id);
                  const meta = STATUS_META[a.status] ?? STATUS_META.staff_review;
                  const eventAt = a.adminDecision?.at ?? a.staffDecision?.at ?? a.submittedAt;
                  const showEmail = needsEmailReminder(a.status);

                  return (
                    <button
                      key={a.id}
                      onClick={() => open(a.id)}
                      className={`w-full text-left px-4 py-3.5 border-b border-gray-200 hover:bg-white transition-colors cursor-pointer ${
                        unread ? "bg-cyan-50/60" : "bg-[#f4f5f7]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-gray-900">
                          {meta.label[lang] ?? meta.label.en}
                        </span>
                        {unread && (
                          <span className="h-2 w-2 rounded-full bg-[#3C8DBC]" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        {lang === "am" ? a.serviceType?.nameAm : a.serviceType?.name}
                      </p>

                      <p className="text-xs text-gray-700 leading-snug">
                        {bodyText(a.status, lang, a)}
                      </p>

                      {showEmail && (
                        <p className="text-[11px] font-semibold text-[#3C8DBC] mt-1.5">
                          {emailReminder[lang] ?? emailReminder.en}
                        </p>
                      )}

                      <p className="text-[10px] text-gray-400 font-mono mt-2">
                        {formatEthRelative(eventAt, lang)}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            {updates.length > 0 && (
              <button
                onClick={() => navigate("/applicant/dashboard")}
                className="w-full text-center py-3 text-xs font-semibold uppercase tracking-wider text-[#3C8DBC] hover:bg-gray-100 transition-colors border-t border-gray-200 bg-white cursor-pointer"
              >
                {lang === "am" ? "ሁሉንም ይመልከቱ" : "View All"}
              </button>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
