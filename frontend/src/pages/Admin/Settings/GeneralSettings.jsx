import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage.js";
import { api } from "@/services/api.js";

const DEFAULTS = {
  orgNameEn: "",
  orgNameAm: "",
  address: "",
  contactEmail: "",
  contactPhone: "",
};

export default function GeneralSettings() {
  const { t } = useLanguage();
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then((data) => setForm({ ...DEFAULTS, ...data }))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveSettings(form);
      toast.success(t("toast_orgSaved"));
    } catch (err) {
      toast.error(err.message || t("toast_orgSaveFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-[13px] text-gray-400 p-6">Loading…</p>;

  return (
    <form onSubmit={handleSubmit} className="bg-paper-card border border-gray-200 shadow-sm p-6 max-w-lg">
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gray-500 mb-1">
        {t("tab_general")}
      </p>
      <h2 className="font-serif text-[19px] text-[#212121] mb-5">{t("orgInfoTitle")}</h2>

      <div className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-gray-500 mb-1.5">
            {t("orgNameEnLabel")}
          </label>
          <input value={form.orgNameEn} onChange={(e) => update("orgNameEn", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-[13px] text-[#212121] focus:border-[#3C8DBC] outline-none" />
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-gray-500 mb-1.5">
            {t("orgNameAmLabel")}
          </label>
          <input value={form.orgNameAm} onChange={(e) => update("orgNameAm", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-[13px] text-[#212121] focus:border-[#3C8DBC] outline-none" />
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-gray-500 mb-1.5">
            {t("addressTitle")}
          </label>
          <input value={form.address} onChange={(e) => update("address", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-[13px] text-[#212121] focus:border-[#3C8DBC] outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-gray-500 mb-1.5">
              {t("contactEmail")}
            </label>
            <input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-[13px] text-[#212121] focus:border-[#3C8DBC] outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-gray-500 mb-1.5">
              {t("contactPhone")}
            </label>
            <input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-[13px] text-[#212121] focus:border-[#3C8DBC] outline-none" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="mt-5 bg-[#3C8DBC] hover:bg-[#357ca5] text-white font-sans text-[13px] font-semibold tracking-[0.06em] uppercase px-5 py-2.5 disabled:opacity-60">
        {saving ? "Saving…" : t("saveChanges")}
      </button>
    </form>
  );
}
