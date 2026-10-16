import { useState } from "react";
import { User, Tags, Users } from "lucide-react";
import AccountSettings from "./AccountSettings.jsx";
import ServiceTypesSettings from "./ServiceTypesSettings.jsx";
import UserManagementSettings from "./UserManagementSettings.jsx";
import { useLanguage } from "@/hooks/useLanguage.js";

export default function SettingsPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("account");

  const TABS = [
    { key: "account", label: t("tab_account"), Icon: User },
    { key: "users", label: t("tab_users"), Icon: Users },
    { key: "serviceTypes", label: t("tab_serviceTypes"), Icon: Tags },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#3C8DBC] mb-1">
        {t("administrator")}
      </p>
      <h1 className="text-2xl font-bold text-[#212121] mb-6">
        {t("nav_settings")}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6">
        <nav className="flex sm:flex-col gap-1.5 bg-white p-2 rounded-xl border border-gray-200 shadow-md h-fit">
          {TABS.map((tItem) => (
            <button
              key={tItem.key}
              onClick={() => setTab(tItem.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-lg text-left transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                tab === tItem.key
                  ? "bg-[#3C8DBC] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <tItem.Icon size={16} />
              {tItem.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "account" && <AccountSettings />}
          {tab === "users" && <UserManagementSettings />}
          {tab === "serviceTypes" && <ServiceTypesSettings />}
        </div>
      </div>
    </div>
  );
}
