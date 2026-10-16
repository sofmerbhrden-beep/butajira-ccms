import { useEffect, useState, useCallback } from "react";
import { KeyRound, Ban, CheckCircle2, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage.js";
import { api } from "@/services/api.js";

const ROLE_STYLES = {
  applicant: "bg-gray-100 text-gray-700 border-gray-200",
  staff:     "bg-sky-50 text-[#3C8DBC] border-sky-200",
  admin:     "bg-[#1A2226] text-white border-[#1A2226]",
};

export default function UserManagementSettings() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [revealMap, setRevealMap] = useState({});

  const ROLE_LABELS = {
    applicant: t("role_applicant"),
    staff: t("role_staff"),
    admin: t("role_admin"),
  };

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.users();
      setUsers(data.items ?? data);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function toggleActive(u) {
    try {
      const updated = await api.updateUser(u.id, { active: !u.active });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
      toast.success(u.active ? t("toast_userDeactivated") : t("toast_userReactivated"));
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function resetPassword(id) {
    try {
      const result = await api.resetPassword(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...result } : u)));
      setRevealMap((m) => ({ ...m, [id]: result.tempPassword }));
      toast.success(t("toast_passwordReset"));
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setConfirmDeleteId(null);
      toast.success(t("toast_accountRemoved"));
    } catch (err) {
      toast.error(err.message);
    }
  }

  function copyPassword(pw) {
    navigator.clipboard?.writeText(pw);
    toast.success(t("toast_copied"));
  }

  if (loading) return <p className="text-xs text-gray-500 p-6 font-medium">Loading…</p>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
        {t("userAccountsCount", { count: users.length })}
      </p>
      <p className="text-xs text-gray-500 mb-5 font-medium">{t("userMgmtHint")}</p>

      <div className="border border-gray-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1fr_100px_90px_160px_110px] gap-3 px-4 py-2.5 bg-[#1A2226] text-white text-xs font-semibold uppercase tracking-wider">
          <span>{t("col_user")}</span>
          <span>{t("col_role")}</span>
          <span>{t("col_status")}</span>
          <span>{t("col_tempPassword")}</span>
          <span />
        </div>

        {users.map((u) => (
          <div key={u.id} className="border-b border-gray-100 last:border-b-0">
            {confirmDeleteId === u.id ? (
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-rose-50 border-l-4 border-rose-500">
                <span className="text-xs text-rose-900 font-semibold">
                  {t("deleteAccountConfirm", { username: u.username })}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-md px-3 py-1 font-bold transition-colors cursor-pointer"
                  >
                    {t("yesDelete")}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs text-gray-700 border border-gray-300 bg-white rounded-md px-3 py-1 font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {t("cancelAction")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[1fr_100px_90px_160px_110px] gap-3 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
                <span className="min-w-0">
                  <span className="text-sm font-bold text-gray-900 block truncate">{u.username}</span>
                  {u.fullName && (
                    <span className="text-xs text-gray-500 block truncate font-medium">{u.fullName}</span>
                  )}
                </span>

                <span className={`inline-flex justify-center border px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${ROLE_STYLES[u.role]}`}>
                  {ROLE_LABELS[u.role]}
                </span>

                <span className={`text-xs font-semibold uppercase ${u.active ? "text-emerald-600" : "text-gray-400"}`}>
                  {u.active ? t("activeLabel") : t("disabledLabel")}
                </span>

                <span className="font-mono text-xs">
                  {revealMap[u.id] ? (
                    <button
                      onClick={() => copyPassword(revealMap[u.id])}
                      className="flex items-center gap-1.5 text-[#3C8DBC] font-bold hover:underline cursor-pointer"
                      title="Click to copy"
                    >
                      {revealMap[u.id]} <Copy size={12} />
                    </button>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </span>

                <div className="flex gap-2 justify-end">
                  <button onClick={() => resetPassword(u.id)} title="Reset password"
                    className="text-gray-400 hover:text-[#3C8DBC] transition-colors cursor-pointer">
                    <KeyRound size={15} />
                  </button>
                  <button onClick={() => toggleActive(u)} title={u.active ? "Deactivate" : "Reactivate"}
                    className="text-gray-400 hover:text-amber-600 transition-colors cursor-pointer">
                    {u.active ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                  </button>
                  <button onClick={() => setConfirmDeleteId(u.id)} title="Delete"
                    className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer">
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
