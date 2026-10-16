import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileCheck2,
  ChevronDown,
  Eye,
  Clock,
  List,
  UserCheck,
  ShieldCheck,
  Award,
  XCircle,
  BarChart2,
  TrendingUp,
} from "lucide-react";
import AdminProfileMenu from "./AdminProfileMenu.jsx";
import { useAuth } from "@/hooks/useAuth.js";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    Icon: LayoutDashboard,
    children: [
      { to: "/admin/dashboard/overview", label: "Overview", Icon: Eye },
      { to: "/admin/dashboard/pending", label: "Pending Review", Icon: Clock },
    ],
  },
  {
    label: "Applications",
    Icon: FileCheck2,
    children: [
      { to: "/admin/application", label: "All", Icon: List },
      {
        to: "/admin/application?status=staff_review",
        label: "Pending Staff",
        Icon: UserCheck,
      },
      {
        to: "/admin/application?status=admin_review",
        label: "Pending Admin",
        Icon: ShieldCheck,
      },
      {
        to: "/admin/application?status=certificate_generated",
        label: "Issued",
        Icon: Award,
      },
      {
        to: "/admin/application?status=rejected",
        label: "Rejected",
        Icon: XCircle,
      },
    ],
  },
  {
    label: "Reports",
    Icon: BarChart2,
    children: [
      { to: "/admin/dashboard/analytics", label: "Analytics & Charts", Icon: TrendingUp },
      { to: "/admin/reports", label: "Generate Report", Icon: BarChart2 },
    ],
  },
];

export default function AdminSidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname + location.search;
  const [openMenus, setOpenMenus] = useState(() => new Set(["Dashboard", "Applications", "Reports"]));
  
  function toggleMenu(label) {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  return (
    <aside
      className={`h-full flex flex-col shrink-0 bg-[#1A2226] transition-all duration-200 z-50 border-r border-white/10 ${
        collapsed
          ? "w-0 -translate-x-full opacity-0 md:relative md:w-[60px] md:translate-x-0 md:opacity-100"
          : "absolute w-[220px] translate-x-0 opacity-100 md:relative"
      }`}
    >
      <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-1 p-2 w-full">
        {!collapsed && (
          <div className="px-3 pt-3 pb-1 font-mono text-[10px] uppercase font-bold text-[#4B646F] tracking-wider">
            MAIN NAVIGATION
          </div>
        )}
        {NAV_ITEMS.map((item) => {
          const isOpen = openMenus.has(item.label);
          const isChildActive = item.children.some((c) => currentPath === c.to);

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleMenu(item.label)}
                className={`w-full flex items-center justify-between gap-2.5 rounded-md px-3 py-2.5 text-[13px] font-semibold transition-colors cursor-pointer border-none outline-none ${
                  isChildActive
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span className="flex items-center gap-2.5">
                  <item.Icon size={17} className="shrink-0 text-gray-300" />
                  {!collapsed && <span>{item.label}</span>}
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
                      {item.children.map((child) => {
                        const active = currentPath === child.to;
                        const showWarn = child.warn && user?.mustChangePassword;
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={`flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-md transition-all ${
                              active
                                ? "border-l-2 border-white bg-white/15 text-white font-bold pl-2.5 shadow-2xs"
                                : "border-l-2 border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-100"
                            }`}
                          >
                            <child.Icon size={14} className="shrink-0" />
                            <span className="flex-1">{child.label}</span>
                            {showWarn && (
                              <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                            )}
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

      <div className="shrink-0 border-t border-white/10 p-2 w-full bg-[#1A2226]">
        <AdminProfileMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}
