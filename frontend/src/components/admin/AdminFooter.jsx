import { ethYear } from "@/utils/ethDate.js";

export default function AdminFooter() {
  return (
    <footer className="w-full shrink-0 border-t border-gray-300 bg-gray-100 px-4 sm:px-6 py-4 mt-auto">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-gray-500 font-sans">
        <span>&copy; {ethYear()} Science & IT Department, Butajira City Administration. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <a href="tel:+251934567890" className="hover:text-[#3C8DBC] transition-colors">
            Support: +251 93 456 7890
          </a>
          <a href="mailto:itdepartment@butajiracity.gov.et" className="hover:text-[#3C8DBC] transition-colors">
            itdepartment@butajiracity.gov.et
          </a>
        </div>
      </div>
    </footer>
  );
}
