import { Check } from "lucide-react";

export default function Stepper({ steps, currentStep }) {
  return (
    <div>
      <div className="sm:hidden flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3.5 mb-6 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
          Step {currentStep + 1} of {steps.length}: <span className="font-bold text-[#3C8DBC]">{steps[currentStep]}</span>
        </span>
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i <= currentStep ? "bg-[#3C8DBC]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <ol className="hidden sm:flex items-start mb-10 overflow-x-auto pb-2">
        {steps.map((label, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <li key={label} className="flex-1 flex items-center last:flex-none min-w-[70px]">
              <div className="flex flex-col items-center gap-2 w-20 sm:w-24 -ml-2 first:ml-0">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-all duration-300 ${
                    done
                      ? "bg-[#3C8DBC] border-[#3C8DBC] text-white shadow-sm"
                      : active
                        ? "bg-white border-[#3C8DBC] text-[#3C8DBC] shadow-sm ring-4 ring-sky-100"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  {done ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={`text-[11px] text-center leading-tight transition-colors duration-300 ${
                    active
                      ? "text-[#3C8DBC] font-bold uppercase tracking-wider"
                      : done
                        ? "text-gray-900 font-semibold uppercase tracking-wider"
                        : "text-gray-400 font-medium uppercase tracking-wider"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 mt-[-26px] h-[2px] bg-gray-200 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#3C8DBC] transition-all duration-500 ease-out"
                    style={{ width: done ? "100%" : "0%" }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
