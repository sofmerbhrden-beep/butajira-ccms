import { useState } from "react";
import { DayPicker, amET, enUS } from "@daypicker/ethiopic";
import "@daypicker/react/style.css";
import * as Popover from "@radix-ui/react-popover";
import { toEthiopian } from "../utils/ethDate.js";

const MIN_DATE = new Date(1957, 8, 11);  // ET 1950
const MAX_DATE = new Date(2026, 8, 10);  // ET 2018
const DEFAULT_VIEW_DATE = new Date(1992, 8, 11); // ET ~1985

function parseLocalDate(val) {
  if (!val) return undefined;
  if (val instanceof Date) return val;
  const parts = String(val).split("T")[0].split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const parsed = new Date(y, m, d);
    if (!isNaN(parsed)) return parsed;
  }
  const fallback = new Date(val);
  return isNaN(fallback) ? undefined : fallback;
}

function formatYMD(date) {
  if (!date || isNaN(date)) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function EthiopianDobPicker({ value, onChange, lang = "en", className, placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = parseLocalDate(value);

  function formatDisplay(date) {
    const { year, month, day } = toEthiopian(date);
    return `${String(day).padStart(2,"0")}/${String(month).padStart(2,"0")}/${String(year).slice(-2)}`;
  }

  const displayValue = selected ? formatDisplay(selected) : "";
  const placeholderText = placeholder || (lang === "am" ? "ቀን ይምረጡ" : "Select date");

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={className || "h-10 w-full rounded-lg border border-gray-300 bg-paper-card px-2.5 text-left text-sm text-black hover:border-gray-400 focus-visible:border-[#3C8DBC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C8DBC]/20"}
        >
          {displayValue || <span className={className ? "text-gray-500" : "text-gray-500"}>{placeholderText}</span>}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-[100] bg-white border-2 border-black rounded-[8px] shadow-[8px_8px_0px_rgba(0,0,0,1)] p-0 overflow-hidden
            [&_.rdp-root]:text-gray-900
            [&_.rdp-month_caption]:bg-black [&_.rdp-month_caption]:border-b-2 [&_.rdp-month_caption]:border-black [&_.rdp-month_caption]:px-3 [&_.rdp-month_caption]:py-3
            [&_.rdp-dropdowns]:gap-2
            [&_.rdp-dropdown]:bg-white [&_.rdp-dropdown]:text-gray-900 [&_.rdp-dropdown]:border [&_.rdp-dropdown]:border-black [&_.rdp-dropdown]:rounded-md [&_.rdp-dropdown]:text-[12px] [&_.rdp-dropdown]:px-1
            [&_.rdp-caption_label]:text-white [&_.rdp-caption_label]:font-semibold
            [&_.rdp-button_previous]:text-white [&_.rdp-button_previous]:hover:bg-gray-800 [&_.rdp-button_previous]:rounded-md
            [&_.rdp-button_next]:text-white [&_.rdp-button_next]:hover:bg-gray-800 [&_.rdp-button_next]:rounded-md
            [&_.rdp-weekday]:text-[11px] [&_.rdp-weekday]:font-bold [&_.rdp-weekday]:text-black [&_.rdp-weekday]:bg-gray-100 [&_.rdp-weekday]:py-1.5 [&_.rdp-weekday]:border-b-2 [&_.rdp-weekday]:border-black [&_.rdp-weekday]:cursor-default [&_.rdp-weekday]:select-none
            [&_.rdp-weeks]:bg-white [&_.rdp-weeks]:px-3 [&_.rdp-weeks]:pb-3 [&_.rdp-weeks]:pt-2
            [&_.rdp-day_button]:text-black [&_.rdp-day_button]:rounded-md [&_.rdp-day_button:hover]:bg-gray-200
            [&_.rdp-selected_.rdp-day_button]:bg-black [&_.rdp-selected_.rdp-day_button]:text-white [&_.rdp-selected_.rdp-day_button:hover]:bg-gray-800
            [&_.rdp-today_.rdp-day_button]:font-bold [&_.rdp-today_.rdp-day_button]:text-black [&_.rdp-today_.rdp-day_button]:border-2 [&_.rdp-today_.rdp-day_button]:border-black
            [&_.rdp-outside_.rdp-day_button]:text-gray-300"
        >
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected ?? DEFAULT_VIEW_DATE}
            onSelect={(date) => {
              if (!date) return;
              onChange(formatYMD(date));
              setOpen(false);
            }}
            captionLayout="dropdown"
            startMonth={MIN_DATE}
            endMonth={MAX_DATE}
            numerals="latn"
            locale={lang === "am" ? amET : enUS}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
