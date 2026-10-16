import { useMemo, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Award,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Inbox,
} from "lucide-react";
import RoleShell from "../../components/RoleShell.jsx";
import AdminStatusPill from "../../components/AdminStatusPill.jsx";
import { Card, CardContent } from "../../components/ui/card.jsx";
import { useAppData } from "@/hooks/useAppData.js";
import { formatEthDate } from "@/utils/ethDate.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/hooks/useAuth.js";
import { api } from "@/services/api.js";

const PAGE_SIZE = 5;

const FILTERS = [
  { key: "analytics", label: "Analytics & Reports" },
  { key: "admin_review", label: "Pending my review" },
  { key: "certificate_generated", label: "Certificates issued" },
  { key: "all", label: "All" },
];

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { applications } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.getAnalytics()
      .then(data => setAnalytics(data))
      .catch(console.error);
  }, []);

  const rawFilter = searchParams.get("filter");
  const isAnalytics = rawFilter === "analytics";
  const isOverview = !rawFilter;
  const filter = rawFilter || "admin_review";

  function setFilter(key) {
    setSearchParams(key === "admin_review" ? {} : { filter: key });
  }

  const counts = useMemo(() => {
    const today = new Date().toDateString();
    return {
      today: applications.filter(
        (a) => new Date(a.submittedAt).toDateString() === today,
      ).length,
      pending: applications.filter((a) => a.status === "admin_review").length,
      issued: applications.filter((a) => a.status === "certificate_generated")
        .length,
      rejected: applications.filter((a) => a.status.endsWith("rejected"))
        .length,
    };
  }, [applications]);

  const rows = useMemo(() => {
    let list =
      filter === "all"
        ? applications
        : applications.filter((a) => a.status === filter);
        
    if (typeFilter !== "all") {
      list = list.filter((a) => a.applicationType === typeFilter);
    }
    
    return [...list].sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
    );
  }, [applications, filter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));



  useEffect(() => {
    setPage(1);
  }, [filter, typeFilter]);

  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(
    () => rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [rows, currentPage],
  );

  const stats = [
    {
      label: "Applications today",
      value: counts.today,
      Icon: CalendarDays,
      accent: "text-[#5865f2]",
      glow: "bg-[#5865f2]/20",
    },
    {
      label: "Pending my review",
      value: counts.pending,
      Icon: Clock,
      accent: "text-amber-400",
      glow: "bg-amber-400/20",
    },
    {
      label: "Certificates issued",
      value: counts.issued,
      Icon: Award,
      accent: "text-emerald-400",
      glow: "bg-emerald-400/20",
    },
    {
      label: "Rejected",
      value: counts.rejected,
      Icon: XCircle,
      accent: "text-red-400",
      glow: "bg-red-400/20",
    },
  ];

  return (
    <RoleShell role="Admin" userLabel="admin">
      <div className="relative mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#3C8DBC] mb-1">
          Overview
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card className="bg-white rounded-xl border border-gray-200/80 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 p-5">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-2xl font-bold text-gray-900 leading-none">
                      {s.value}
                    </p>
                    <div className="h-9 w-9 rounded-lg bg-sky-50 flex items-center justify-center border border-sky-100 shadow-xs">
                      <s.Icon size={20} className="text-[#3C8DBC]" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {s.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                  filter === f.key && !isOverview
                    ? "bg-[#3C8DBC] text-white shadow-md hover:bg-[#357ca5]"
                    : "bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {!isOverview && (
            <div className="flex border border-gray-200 bg-white rounded-xl p-1 shadow-sm w-max">
              {["all", "new", "renewal"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                    typeFilter === type
                      ? "bg-[#3C8DBC] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {type === "all" ? "All Types" : type === "new" ? "New" : "Renewal"}
                </button>
              ))}
            </div>
          )}
        </div>

        {isAnalytics ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Analytics &amp; System Reports</h2>
            {analytics ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                  <p className="text-base font-bold text-gray-900 mb-6">Applications (Last 6 Months)</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.trendData}>
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="applications" fill="#3C8DBC" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                  <p className="text-base font-bold text-gray-900 mb-6">Status Distribution</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analytics.statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3C8DBC', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4 flex-wrap">
                      {analytics.statusData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                          <span className="w-3 h-3 rounded-full" style={{backgroundColor: ['#3C8DBC', '#10b981', '#f59e0b', '#ef4444'][index % 4]}}></span>
                          {entry.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 font-medium">Loading analytics data...</div>
            )}
          </div>
        ) : isOverview ? (
          <Card className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <p className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Recent Activity
            </p>
            {rows.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 font-medium">
                No applications yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 border border-gray-200/80 rounded-xl overflow-hidden shadow-xs">
                {rows.slice(0, 5).map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-sky-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/application/${a.id}`)}
                  >
                    <span className="text-sm font-bold text-gray-900 truncate mb-1 sm:mb-0">
                      {a.applicant.fullName}
                    </span>
                    <span className="text-xs text-gray-500 font-medium shrink-0">
                      {a.serviceType?.name} · {formatEthDate(a.submittedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : (
          <Card className="bg-white rounded-xl border border-gray-200/80 shadow-md overflow-hidden">
            <div className="hidden lg:grid grid-cols-[1fr_180px_140px_140px_20px] gap-4 px-6 py-3.5 bg-[#1A2226] text-white text-xs font-semibold uppercase tracking-wider">
              <span>Applicant</span>
              <span>Service</span>
              <span>Submitted</span>
              <span>Status</span>
              <span />
            </div>

            {rows.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-400">
                <Inbox size={40} className="mb-3 text-gray-300" strokeWidth={1.5} />
                <p className="text-sm font-medium text-gray-500">
                  No applications in this view.
                </p>
              </div>
            ) : (
              pagedRows.map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/admin/application/${a.id}`)}
                  className="w-full grid grid-cols-1 lg:grid-cols-[1fr_180px_140px_140px_20px] gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 items-center text-left hover:bg-sky-50/40 transition-all duration-150 active:scale-[0.995] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="h-9 w-9 rounded-lg shrink-0 bg-sky-50 text-[#3C8DBC] font-bold text-xs flex items-center justify-center border border-sky-100 shadow-xs">
                      {initials(a.applicant.fullName)}
                    </span>
                    <span className="min-w-0">
                      <span className="text-sm font-bold text-gray-900 block truncate">
                        {a.applicant.fullName}
                      </span>
                      <span className="text-xs text-gray-500 block lg:hidden mt-0.5 font-medium">
                        {a.serviceType?.name}
                      </span>
                    </span>
                  </span>
                  <span className="text-xs text-gray-600 font-medium truncate hidden lg:block">
                    {a.serviceType?.name}
                  </span>
                  <span className="text-xs text-gray-500 font-medium hidden lg:block">
                    {formatEthDate(a.submittedAt)}
                  </span>
                  <div className="flex items-center justify-between lg:justify-start lg:block w-full">
                    <span className="text-xs text-gray-500 block lg:hidden font-medium">
                      {formatEthDate(a.submittedAt)}
                    </span>
                    <AdminStatusPill status={a.status} />
                  </div>
                  <ChevronRight size={18} className="text-gray-400 hidden lg:block" />
                </button>
              ))
            )}

            {rows.length > 0 && (
              <div className="flex items-center justify-between gap-4 px-6 py-3.5 border-t border-gray-200 bg-gray-50/50">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg px-3.5 py-1.5 hover:bg-gray-50 hover:shadow-md active:scale-[0.98] disabled:opacity-40 transition-all duration-150 shadow-sm cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Page
                  </span>
                  <select
                    value={currentPage}
                    onChange={(e) => setPage(Number(e.target.value))}
                    className="bg-white border border-gray-300 rounded-lg text-gray-700 text-xs font-semibold px-2.5 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ),
                    )}
                  </select>
                  <span className="text-xs text-gray-500 font-medium">
                    of {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg px-3.5 py-1.5 hover:bg-gray-50 hover:shadow-md active:scale-[0.98] disabled:opacity-40 transition-all duration-150 shadow-sm cursor-pointer"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </Card>
        )}
      </div>
    </RoleShell>
  );
}
