import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { useAppData } from "@/hooks/useAppData.js";
import CertificatePreview from "../../components/CertificatePreview.jsx";

export default function CertificatePrintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById } = useAppData();
  const app = getById(id);

  const history = app?.certificate?.history || {};
  const years = Object.keys(history).sort((a, b) => Number(b) - Number(a));
  const [selectedYear, setSelectedYear] = useState(null);
  const activeYear = selectedYear || app?.certificate?.latestYear || years[0];

  if (!app?.certificate) {
    return (
      <div className="p-8 text-gray-500 text-xs">
        Certificate not found.{" "}
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors shadow-sm ml-2"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          html, body { height: 100% !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden !important; }
          #cert-print-area, #cert-print-area * { visibility: visible !important; }
          #cert-print-area {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
          }
          #cert-print-area > div {
            width: 190mm !important;
            max-width: 190mm !important;
            transform: scale(0.82) !important;
            transform-origin: center center !important;
          }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg px-3.5 py-2 hover:bg-gray-50 hover:shadow-md active:scale-[0.98] transition-all duration-150 shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center gap-3">
          {years.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Version
              </span>
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                      String(activeYear) === String(y)
                        ? "bg-[#3C8DBC] text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs font-bold text-white bg-[#3C8DBC] hover:bg-[#357ca5] active:scale-[0.98] rounded-lg px-4 py-2 transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg"
          >
            <Printer size={14} /> Print Certificate
          </button>
        </div>
      </div>


      <div id="cert-print-area" className="flex justify-center">
        <div className="w-full max-w-[794px]">
          <CertificatePreview app={app} selectedYear={activeYear} />
        </div>
      </div>
    </>
  );
}
