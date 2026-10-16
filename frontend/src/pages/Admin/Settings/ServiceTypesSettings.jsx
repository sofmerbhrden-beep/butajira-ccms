import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../services/api.js";
import { useLanguage } from "@/hooks/useLanguage.js";

const EMPTY_DRAFT = { code: "", tier: "", name: "", nameAm: "" };

const inputCls = "w-full h-9 bg-gray-50 border border-gray-300 rounded-lg px-3 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white transition-all";

export default function ServiceTypesSettings() {
  const { t, lang } = useLanguage();
  const [types, setTypes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(EMPTY_DRAFT);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addDraft, setAddDraft] = useState(EMPTY_DRAFT);

  useEffect(() => {
    api.serviceTypes()
      .then((collection) => setTypes(collection.items))
      .catch((err) => toast.error(err.message));
  }, []);

  function startEdit(tRow) {
    setEditingId(tRow.id);
    setEditDraft({ code: tRow.code, tier: tRow.tier || "", name: tRow.name, nameAm: tRow.nameAm });
  }

  async function saveEdit() {
    if (!editDraft.code.trim() || !editDraft.name.trim()) { toast.error(t("err_codeNameRequired")); return; }
    try {
      const updated = await api.updateServiceType(editingId, {
        code: editDraft.code.trim(),
        tier: editDraft.tier.trim() || null,
        name: editDraft.name.trim(),
        nameAm: editDraft.nameAm.trim(),
      });
      setTypes((prev) => prev.map((row) => (row.id === editingId ? updated : row)));
      setEditingId(null);
      toast.success(t("toast_typeUpdated"));
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleAdd() {
    if (!addDraft.code.trim() || !addDraft.name.trim()) { toast.error(t("err_codeNameRequired")); return; }
    try {
      const created = await api.createServiceType({
        code: addDraft.code.trim(),
        tier: addDraft.tier.trim() || null,
        name: addDraft.name.trim(),
        nameAm: addDraft.nameAm.trim(),
      });
      setTypes((prev) => [...prev, created]);
      setAddDraft(EMPTY_DRAFT);
      setShowAddForm(false);
      toast.success(t("toast_typeAdded"));
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteServiceType(id);
      setTypes((prev) => prev.filter((row) => row.id !== id));
      setConfirmDeleteId(null);
      toast.success(t("toast_typeRemoved"));
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-700">
          {t("serviceTypesCount", { count: types.length })}
        </p>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold bg-[#3C8DBC] hover:bg-[#357ca5] active:scale-[0.98] text-white px-3.5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
        >
          <Plus size={14} /> {t("addServiceType")}
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-5 font-medium">{t("serviceTypesHint")}</p>

      {showAddForm && (
        <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-4 mb-5 shadow-inner">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <input placeholder={t("ph_code")} value={addDraft.code}
              onChange={(e) => setAddDraft((d) => ({ ...d, code: e.target.value }))}
              className={inputCls} />
            <input placeholder={t("ph_tier")} value={addDraft.tier}
              onChange={(e) => setAddDraft((d) => ({ ...d, tier: e.target.value }))}
              className={inputCls} />
            <input placeholder={t("ph_nameEn")} value={addDraft.name}
              onChange={(e) => setAddDraft((d) => ({ ...d, name: e.target.value }))}
              className={`${inputCls} sm:col-span-2`} />
            <input placeholder={t("ph_nameAm")} value={addDraft.nameAm}
              onChange={(e) => setAddDraft((d) => ({ ...d, nameAm: e.target.value }))}
              className={`${inputCls} sm:col-span-4`} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd}
              className="flex items-center gap-1.5 bg-[#3C8DBC] hover:bg-[#357ca5] active:scale-[0.98] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer">
              <Check size={14} /> {t("saveAction")}
            </button>
            <button onClick={() => { setShowAddForm(false); setAddDraft(EMPTY_DRAFT); }}
              className="flex items-center gap-1.5 text-gray-700 font-semibold text-xs border border-gray-300 bg-white px-3.5 py-1.5 rounded-lg hover:bg-gray-100 active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-xs">
              <X size={14} /> {t("cancelAction")}
            </button>
          </div>
        </div>
      )}

      <div className="border border-gray-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[80px_100px_1fr_80px] gap-3 px-4 py-2.5 bg-[#1A2226] text-white text-xs font-semibold uppercase tracking-wider">
          <span>{t("col_code")}</span>
          <span>{t("col_tier")}</span>
          <span>{t("col_name")}</span>
          <span />
        </div>

        {types.map((row) => (
          <div key={row.id} className="border-b border-gray-100 last:border-b-0">
            {editingId === row.id ? (
              <div className="grid grid-cols-[80px_100px_1fr_80px] gap-3 px-4 py-3 items-start bg-blue-50/40">
                <input value={editDraft.code}
                  onChange={(e) => setEditDraft((d) => ({ ...d, code: e.target.value }))}
                  className={inputCls} />
                <input value={editDraft.tier}
                  onChange={(e) => setEditDraft((d) => ({ ...d, tier: e.target.value }))}
                  className={inputCls} />
                <div className="space-y-1.5">
                  <input value={editDraft.name} placeholder={t("ph_nameEn")}
                    onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                    className={inputCls} />
                  <input value={editDraft.nameAm} placeholder={t("ph_nameAm")}
                    onChange={(e) => setEditDraft((d) => ({ ...d, nameAm: e.target.value }))}
                    className={inputCls} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEdit} className="text-[#3C8DBC] hover:text-[#357ca5] transition-colors cursor-pointer">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : confirmDeleteId === row.id ? (
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-rose-50 border-l-4 border-rose-500">
                <span className="text-xs text-rose-900 font-semibold">
                  {t("deleteConfirmType", { name: row.name })}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(row.id)}
                    className="text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-md px-3 py-1 font-bold transition-colors cursor-pointer">
                    {t("yesDelete")}
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)}
                    className="text-xs text-gray-700 border border-gray-300 bg-white rounded-md px-3 py-1 font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
                    {t("cancelAction")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[80px_100px_1fr_80px] gap-3 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
                <span className="font-mono text-xs text-[#3C8DBC] font-bold">{row.code}</span>
                <span className="text-xs text-gray-500 font-medium">{row.tier || "-"}</span>
                <span className="text-sm text-gray-900 font-medium truncate">{lang === "am" ? row.nameAm : row.name}</span>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => startEdit(row)} className="text-gray-400 hover:text-[#3C8DBC] transition-colors cursor-pointer">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setConfirmDeleteId(row.id)} className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
