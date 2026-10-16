import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Check, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage.js";

const LANGUAGES = [
  { code: "en", label: "English", short: "ENG" },
  { code: "am", label: "አማርኛ", short: "አማ" },
];

export default function LanguageToggle({ className = "", light = false }) {
  const { lang, setLang } = useLanguage();
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const baseStyle = light
    ? "bg-white hover:bg-gray-50 text-gray-800 border-gray-300 shadow-xs"
    : "bg-black/20 hover:bg-black/30 text-white border-white/20 shadow-xs";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors outline-none cursor-pointer ${baseStyle} ${className}`}
        >
          <Globe size={13} className="opacity-80 shrink-0" />
          <span className="font-semibold tracking-wide">{current.label}</span>
          <ChevronDown size={12} className="opacity-60 shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={5}
          className="min-w-[140px] bg-white border border-gray-200 rounded-md shadow-md p-1 z-50 overflow-hidden"
        >
          {LANGUAGES.map((l) => (
            <DropdownMenu.Item
              key={l.code}
              onSelect={() => setLang(l.code)}
              className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 rounded-md cursor-pointer outline-none hover:bg-sky-50 hover:text-[#3C8DBC] transition-colors"
            >
              <span>{l.label}</span>
              {lang === l.code && (
                <Check size={14} className="text-[#3C8DBC] shrink-0" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
