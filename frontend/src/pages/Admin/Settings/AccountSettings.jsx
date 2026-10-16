import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage.js";
import { useAuth } from "@/hooks/useAuth.js";
import { api } from "@/services/api.js";

export default function AccountSettings() {
  const { t } = useLanguage();
  const { user, setUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmitPassword(e) {
    e.preventDefault();
    setError("");
    if (!currentPassword.trim()) { setError(t("err_enterCurrentPassword")); return; }
    if (newPassword.length < 8) { setError(t("err_passwordMinLength")); return; }
    if (newPassword !== confirmPassword) { setError(t("err_passwordMismatch")); return; }
    setSaving(true);
    try {
      await api.changePassword(user.id, currentPassword, newPassword);
      toast.success(t("toast_passwordUpdated"));
      setUser((u) => ({ ...u, mustChangePassword: false }));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-md space-y-4">
      {user?.mustChangePassword && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900 font-semibold">
          ⚠ You're using a temporary password. Please set a new one below.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-5">
          {t("changePassword") || "Change password"}
        </p>

        <form onSubmit={handleSubmitPassword} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              {user?.mustChangePassword ? "Temporary password" : t("currentPassword")}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white transition-all shadow-xs"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              {t("newPasswordLabel")}
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white transition-all shadow-xs"
              />
              <button type="button" onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">{t("passwordMinLengthHint") || "At least 8 characters."}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              {t("confirmNewPassword")}
            </label>
            <input
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white transition-all shadow-xs"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50">
              <p className="text-rose-700 text-xs font-semibold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-10 bg-[#3C8DBC] hover:bg-[#357ca5] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? "Saving…" : t("updatePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}
