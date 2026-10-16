import { useState, useEffect } from "react";
import { FileText, Download, Calendar, ArrowRight, Clock } from "lucide-react";
import { API_ROOT } from "@/services/api.js";
import { toEthiopian } from "@/utils/ethDate.js";

function currentEthDate() {
  return toEthiopian(new Date());
}

function ethToStr({ day, month, year }) {
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

function getEthTimestamp() {
  const eth = toEthiopian(new Date());
  const now = new Date();
  const gHours = now.getHours();
  const gMinutes = String(now.getMinutes()).padStart(2, "0");
  const gSeconds = String(now.getSeconds()).padStart(2, "0");
  const ethHours = (gHours + 6) % 12 || 12;
  const isDay = gHours >= 6 && gHours < 18;
  const ampm = isDay ? "AM" : "PM";
  return `${String(eth.day).padStart(2, "0")}/${String(eth.month).padStart(2, "0")}/${eth.year}, ${ethHours}:${gMinutes}:${gSeconds} ${ampm}`;
}

function EthDateInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
        <Calendar size={14} className="text-[#3C8DBC]" /> {label}
      </label>
      <div className="flex gap-1.5 items-center">
        <input
          type="number"
          min={1}
          max={30}
          placeholder="DD"
          value={value.day}
          onChange={(e) => onChange({ ...value, day: Number(e.target.value) })}
          className="w-14 bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-center font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]"
        />
        <span className="text-gray-400 font-bold">/</span>
        <input
          type="number"
          min={1}
          max={13}
          placeholder="MM"
          value={value.month}
          onChange={(e) => onChange({ ...value, month: Number(e.target.value) })}
          className="w-14 bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-center font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]"
        />
        <span className="text-gray-400 font-bold">/</span>
        <input
          type="number"
          placeholder="YYYY"
          value={value.year}
          onChange={(e) => onChange({ ...value, year: Number(e.target.value) })}
          className="w-20 bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-center font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]"
        />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const eth = currentEthDate();
  const [from, setFrom] = useState({ day: 1, month: 1, year: eth.year });
  const [to, setTo] = useState({ day: eth.day, month: eth.month, year: eth.year });
  const [ready, setReady] = useState(false);
  const [preset, setPreset] = useState("this_year");
  const [nowTimestamp, setNowTimestamp] = useState(getEthTimestamp());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(getEthTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (preset === "this_month") {
      setFrom({ day: 1, month: eth.month, year: eth.year });
      setTo({ day: eth.day, month: eth.month, year: eth.year });
    } else if (preset === "this_year") {
      setFrom({ day: 1, month: 1, year: eth.year });
      setTo({ day: eth.day, month: eth.month, year: eth.year });
    } else if (preset === "last_3_months") {
      let startMonth = eth.month - 3;
      let startYear = eth.year;
      if (startMonth <= 0) {
        startMonth += 13;
        startYear -= 1;
      }
      setFrom({ day: eth.day, month: startMonth, year: startYear });
      setTo({ day: eth.day, month: eth.month, year: eth.year });
    } else if (preset === "all_time") {
      setFrom({ day: 1, month: 1, year: 2010 });
      setTo({ day: eth.day, month: eth.month, year: eth.year });
    }
    setReady(false);
  }, [preset, eth.day, eth.month, eth.year]);

  const downloadUrl = `${API_ROOT}/reports/download?from=${ethToStr(from)}&to=${ethToStr(to)}`;

  const presetOptions = [
    { id: "this_month", label: "This Month" },
    { id: "last_3_months", label: "Last 3 Months" },
    { id: "this_year", label: "This Year" },
    { id: "all_time", label: "All Time" },
    { id: "custom", label: "Custom Range" },
  ];

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col gap-8 shadow-md relative">
        <div className="flex flex-col gap-1 border-b border-gray-200 pb-6 relative">
          <div className="inline-flex items-center gap-1.5 self-end px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-mono font-semibold text-slate-700 mb-2 shadow-2xs">
            <Clock size={13} className="text-[#3C8DBC]" />
            <span>የወጣበት ቀንና ሰዓት: {nowTimestamp}</span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-[#3C8DBC]">
            Analytics & Export
          </p>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText size={26} className="text-[#3C8DBC]" /> System Reports
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Export application activity data in CSV format
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Select Timeframe</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {presetOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPreset(opt.id)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                    preset === opt.id
                      ? "bg-[#3C8DBC] text-white shadow-md"
                      : "bg-gray-50 text-gray-700 border border-gray-200 shadow-xs hover:bg-gray-100 hover:shadow-sm"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {preset === "custom" && (
            <div className="flex items-center gap-6 p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-inner animate-in slide-in-from-top-2 fade-in duration-200">
              <EthDateInput label="Start Date" value={from} onChange={(v) => { setFrom(v); setReady(false); }} />
              <ArrowRight className="mt-6 text-gray-400 shrink-0" size={20} />
              <EthDateInput label="End Date" value={to} onChange={(v) => { setTo(v); setReady(false); }} />
            </div>
          )}

          <button
            onClick={() => setReady(true)}
            className="w-fit flex justify-center items-center gap-2 px-6 py-2.5 mt-2 bg-[#3C8DBC] hover:bg-[#357ca5] active:scale-[0.98] text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
          >
            Generate Report
          </button>
        </div>

        {ready && (
          <div className="mt-2 pt-6 border-t border-gray-200 flex flex-col items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setTimeout(() => setReady(false), 300)}
              className="w-fit flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
            >
              <Download size={16} /> Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
