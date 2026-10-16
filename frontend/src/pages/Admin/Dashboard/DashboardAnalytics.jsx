import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import {
  BarChart2,
  PieChart as PieIcon,
  Award,
  Clock,
  FileText,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Briefcase,
} from "lucide-react";
import { api } from "@/services/api.js";

function formatStatusLabel(rawStatus = "") {
  const normalized = String(rawStatus).toLowerCase().trim().replace(/_/g, " ");
  if (normalized === "certificate generated" || normalized === "certificate_generated") return "Certificates Issued";
  if (normalized === "admin review" || normalized === "admin_review") return "Pending Admin Review";
  if (normalized === "staff review" || normalized === "staff_review") return "Pending Staff Review";
  if (normalized.includes("rejected")) return "Rejected";
  if (normalized === "draft") return "Draft";
  return normalized.replace(/\b\w/g, (l) => l.toUpperCase());
}

const MATPLOTLIB_PALETTE = {
  "Certificates Issued": { primary: "#2ca02c", light: "bg-emerald-50 text-emerald-800 border-emerald-300", Icon: CheckCircle2 },
  "Pending Admin Review": { primary: "#1f77b4", light: "bg-blue-50 text-blue-800 border-blue-300", Icon: Clock },
  "Pending Staff Review": { primary: "#ff7f0e", light: "bg-orange-50 text-orange-800 border-orange-300", Icon: AlertCircle },
  "Rejected": { primary: "#d62728", light: "bg-red-50 text-red-800 border-red-300", Icon: XCircle },
};

const RADIAN = Math.PI / 180;
const renderMatplotlibAutopct = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[12px] font-mono font-extrabold filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export default function DashboardAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6M");
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    api.getAnalytics()
      .then((data) => setAnalytics(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalApplications = useMemo(() => {
    if (!analytics?.statusData) return 0;
    return analytics.statusData.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [analytics]);

  const formattedStatusData = useMemo(() => {
    if (!analytics?.statusData) return [];
    return analytics.statusData.map((s) => {
      const name = formatStatusLabel(s.name);
      const percentage = totalApplications > 0 ? Math.round((s.value / totalApplications) * 100) : 0;
      const meta = MATPLOTLIB_PALETTE[name] || { primary: "#7f7f7f", light: "bg-slate-50 text-slate-800 border-slate-300", Icon: Layers };
      return {
        ...s,
        name,
        percentage,
        color: meta.primary,
        meta,
      };
    });
  }, [analytics, totalApplications]);

  const issuedCount = useMemo(() => {
    if (!analytics?.statusData) return 0;
    const found = analytics.statusData.find((s) =>
      String(s.name).toLowerCase().includes("certificate")
    );
    return found ? found.value : 0;
  }, [analytics]);

  const pendingCount = useMemo(() => {
    if (!analytics?.statusData) return 0;
    return analytics.statusData
      .filter((s) => String(s.name).toLowerCase().includes("review"))
      .reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [analytics]);

  const completionRate = useMemo(() => {
    if (totalApplications === 0) return 0;
    return Math.round((issuedCount / totalApplications) * 100);
  }, [issuedCount, totalApplications]);

  return (
    <div className="space-y-6 pb-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-[#1B2A4A] to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden text-center flex flex-col items-center justify-center">
        <img
          src="/logo2.png"
          alt="Government Seal"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-[0.35] pointer-events-none select-none object-contain filter drop-shadow-2xl"
        />
        <div className="relative z-10 max-w-xl mx-auto space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Analytics &amp; Reports
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-lg mx-auto leading-relaxed">
            System administration analytics decision oversight and certificate issuance control
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 font-medium">
          Loading system metrics…
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-50 border-2 border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                  <BarChart2 size={18} className="text-[#1f77b4]" /> plt.bar(Monthly Submissions)
                </h3>
                <p className="text-xs text-slate-600 font-serif italic">fig, ax = plt.subplots(figsize=(6, 4))</p>
              </div>
              <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded bg-slate-900 text-white border border-slate-800">
                Grid: True
              </span>
            </div>

            <div className="h-72 w-full bg-white border border-slate-300 p-2 rounded">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.trendData || []} margin={{ top: 25, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    fontSize={11}
                    tickLine={{ stroke: "#000", strokeWidth: 1.5 }}
                    axisLine={{ stroke: "#000", strokeWidth: 2 }}
                    stroke="#000"
                    fontFamily="monospace"
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={{ stroke: "#000", strokeWidth: 1.5 }}
                    axisLine={{ stroke: "#000", strokeWidth: 2 }}
                    stroke="#000"
                    allowDecimals={false}
                    fontFamily="monospace"
                  />
                  <Tooltip content={<MatplotlibTooltip />} />
                  <Bar
                    dataKey="applications"
                    name="Applications"
                    fill="#1f77b4"
                    stroke="#0f4c81"
                    strokeWidth={1.5}
                    maxBarSize={48}
                  >
                    <LabelList
                      dataKey="applications"
                      position="top"
                      style={{ fill: "#000", fontWeight: "bold", fontSize: 12, fontFamily: "monospace" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50 border-2 border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                  <PieIcon size={18} className="text-[#2ca02c]" /> plt.pie(Status Distribution)
                </h3>
                <p className="text-xs text-slate-600 font-serif italic">autopct='%1.1f%%', shadow=True</p>
              </div>
              <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded bg-slate-900 text-white border border-slate-800">
                Tableau Palette
              </span>
            </div>

            <div className="h-72 w-full bg-white border border-slate-300 p-2 rounded relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderMatplotlibAutopct}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {formattedStatusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        stroke="#000000"
                        strokeWidth={1.8}
                        style={{
                          transform: activeIndex === index ? "scale(1.04)" : "scale(1)",
                          transformOrigin: "center center",
                          filter: activeIndex === index ? "drop-shadow(3px 5px 8px rgba(0,0,0,0.4))" : "drop-shadow(2px 3px 4px rgba(0,0,0,0.15))",
                          transition: "all 0.2s ease-in-out",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<MatplotlibTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 border-t-2 border-slate-800">
              {formattedStatusData.map((entry, index) => {
                const { Icon } = entry.meta;
                const isHovered = activeIndex === index;
                return (
                  <div
                    key={entry.name}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    className={`p-2 rounded border-2 transition-all cursor-pointer font-mono ${entry.meta.light} ${
                      isHovered ? "ring-2 ring-black shadow-md scale-[1.02]" : "border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-3 h-3 border border-black shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs font-bold truncate">{entry.name}</span>
                      </div>
                      <span className="font-extrabold text-xs shrink-0">{entry.value} ({entry.percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-red-500 font-medium">
          Unable to load system analytics.
        </div>
      )}
    </div>
  );
}

function MatplotlibTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload || payload[0];
    const name = data.name || label || "Metric";
    const value = payload[0].value;
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded border-2 border-black font-mono shadow-2xl text-xs space-y-1">
        <p className="font-extrabold border-b border-slate-700 pb-1">{name}</p>
        <p className="text-emerald-400 font-bold">Count: {value}</p>
      </div>
    );
  }
  return null;
}
