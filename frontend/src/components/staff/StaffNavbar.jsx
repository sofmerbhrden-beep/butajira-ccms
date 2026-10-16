import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Menu, Bell, ChevronRight, CheckCheck } from "lucide-react";
import { Button } from "../ui/button.jsx";
import LanguageToggle from "../LanguageToggle.jsx";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu.jsx";
import { useAppData } from "@/hooks/useAppData.js";
import { useState, useEffect } from "react";

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

export default function StaffNavbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { applications } = useAppData();

  const pending = applications
    .filter((a) => a.status === "staff_review")
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const [readIds, setReadIds] = useState(() => new Set());

  useEffect(() => {
    setReadIds((prev) => {
      const ids = new Set(pending.map((a) => a.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [applications]);

  const unreadCount = pending.filter((a) => !readIds.has(a.id)).length;

  function markRead(id) { setReadIds((prev) => new Set(prev).add(id)); }
  function markAllRead() { setReadIds(new Set(pending.map((a) => a.id))); }
  function openApplication(id) { markRead(id); navigate(`/staff/application/${id}`); }

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
            Staff Dashboard
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
              aria-label="Notifications"
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
                  NOTIFICATIONS
                  {pending.length > 0 && (
                    <span className="ml-1.5 text-gray-400 font-normal text-xs">
                      ({pending.length})
                    </span>
                  )}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-cyan-400 hover:underline cursor-pointer border-none bg-transparent"
                >
                  Mark Read
                </button>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto bg-gray-50">
              {pending.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-gray-500">
                  <Bell size={36} className="text-gray-300 mb-2" strokeWidth={1.5} />
                  <p className="text-xs font-semibold">No pending applications</p>
                </div>
              ) : (
                pending.map((a) => {
                  const unread = !readIds.has(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => openApplication(a.id)}
                      className={`w-full text-left px-4 py-3.5 border-b border-gray-200 hover:bg-white transition-colors cursor-pointer ${
                        unread ? "bg-cyan-50/60" : "bg-[#f4f5f7]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-gray-900">
                          {a.applicant.fullName}
                        </span>
                        {unread && (
                          <span className="h-2 w-2 rounded-full bg-[#3C8DBC]" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        {a.serviceType?.name}
                      </p>

                      <p className="text-[10px] text-gray-400 font-mono mt-1">
                        {formatDistanceToNow(new Date(a.submittedAt), { addSuffix: true })}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            {pending.length > 0 && (
              <button
                onClick={() => navigate("/staff/applications")}
                className="w-full text-center py-3 text-xs font-semibold uppercase tracking-wider text-[#3C8DBC] hover:bg-gray-100 transition-colors border-t border-gray-200 bg-white cursor-pointer"
              >
                View All
              </button>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
