import { useState } from "react";
import {
  useNavigate,
  useSearchParams,
  Link,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Award,
  ListChecks,
  Menu,
  X,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Seal from "./Seal.jsx";
import LanguageToggle from "./LanguageToggle.jsx";
import { useLanguage } from "@/hooks/useLanguage.js";

const ADMIN_NAV_GROUPS = [
  {
    label: "Management",
    Icon: LayoutDashboard,
    children: [
      { key: null, label: "Overview", Icon: LayoutDashboard },
      { key: "analytics", label: "Analytics & Reports", Icon: BarChart3 },
      { key: "admin_review", label: "Pending my review", Icon: Clock },
      { key: "certificate_generated", label: "Certificates issued", Icon: Award },
      { key: "all", label: "All applications", Icon: ListChecks },
    ],
  },
];

export default function RoleShell({
  role,
  userLabel,
  children,
  actions,
  variant = "paper",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const showSidebar = role === "Admin";
  const activeFilter = searchParams.get("filter");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState(() => new Set(["Management"]));

  function toggleMenu(label) {
    if (collapsed) {
      setCollapsed(false);
      setOpenMenus(new Set([label]));
    } else {
      setOpenMenus((prev) => {
        const next = new Set(prev);
        next.has(label) ? next.delete(label) : next.add(label);
        return next;
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#D2D6DE] text-[#212121]">
      <header className="bg-[#3C8DBC] text-white relative z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Seal size={30} />
            <div className="leading-tight">
              <p className="font-serif text-[15px]">{t("orgName")}</p>
              <p className="font-mono text-[11px] font-bold tracking-[0.16em] uppercase text-white">
                {role} {t("portalSuffix")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {showSidebar && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setSidebarOpen((v) => !v);
                  } else {
                    setCollapsed((c) => !c);
                  }
                }}
                className="text-white hover:bg-black/10 p-2 rounded-lg transition-colors cursor-pointer border-none"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
              </button>
            )}
            {actions}
            <LanguageToggle />
            <div className="flex items-center gap-4">
              <span className="font-mono font-semibold text-[12px] text-white/90">
                {userLabel}
              </span>
              <button
                onClick={() => navigate("/")}
                className="font-mono font-bold text-[11px] uppercase bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-none"
              >
                {t("signOut")}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {showSidebar && (
          <aside
            className={`shrink-0 bg-[#1A2226] text-white py-6 px-3 z-40 transition-all border-r border-white/10 ${sidebarOpen ? "block absolute inset-y-0 left-0 w-64" : "hidden md:block"
              } ${collapsed ? "md:w-[60px]" : "md:w-[220px]"}`}
          >
            <nav className="space-y-1">
              {ADMIN_NAV_GROUPS.map((group) => {
                const isOpen = openMenus.has(group.label);

                const isGroupActive = group.children.some((child) => {
                  if (child.key === null) return location.pathname === "/admin/dashboard" && !activeFilter;
                  return activeFilter === child.key;
                });

                return (
                  <div key={group.label}>
                    <button
                      onClick={() => toggleMenu(group.label)}
                      className={`w-full flex items-center justify-between gap-2.5 rounded-md px-3 py-2.5 text-[13px] font-semibold transition-colors cursor-pointer border-none outline-none ${isGroupActive
                          ? "bg-white/10 text-white"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                        } ${collapsed ? "justify-center" : ""}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <group.Icon size={17} className="shrink-0 text-cyan-400" />
                        {!collapsed && <span>{group.label}</span>}
                      </span>
                      {!collapsed && (
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {!collapsed && isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-1.5 ml-2 mr-1 bg-[#171B1F] border border-white/10 rounded-lg p-1.5 flex flex-col gap-1">
                            {group.children.map((child) => {
                              const isActive = child.key === null
                                ? location.pathname === "/admin/dashboard" && !activeFilter
                                : activeFilter === child.key;
                              const to = child.key === null
                                ? "/admin/dashboard"
                                : `/admin/dashboard?filter=${child.key}`;

                              return (
                                <Link
                                  key={child.label}
                                  to={to}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`flex items-center gap-2.5 px-3 py-2 text-[13px] rounded transition-all ${isActive
                                      ? "border-l-2 border-[#4DD9E8] bg-[#4DD9E8]/10 text-[#4DD9E8] font-semibold pl-2.5"
                                      : "border-l-2 border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200"
                                    }`}
                                >
                                  <child.Icon size={14} className="shrink-0" />
                                  <span>{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          </aside>
        )}
        <main
          className={`flex-1 min-w-0 px-6 py-8 ${showSidebar ? "" : "max-w-6xl mx-auto"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
