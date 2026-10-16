import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth.js";
import { api } from "@/services/api.js";

export default function StaffAccountSettings() {
  const { user, setUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!currentPassword.trim()) { setError("Enter your current password."); return; }
    if (newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setSaving(true);
    try {
      await api.changePassword(user.id, currentPassword, newPassword);
      toast.success("Password updated successfully.");
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

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Account</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Security Settings</h1>
      </div>

      {user?.mustChangePassword && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl px-4 py-3.5 text-xs text-amber-900 font-semibold shadow-xs">
          ⚠ You're using a temporary password. Please set a new secure password.
        </div>
      )}

      <div className="bg-white border border-gray-200/80 rounded-xl shadow-md p-6 sm:p-8">
        <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {user?.mustChangePassword ? "Temporary password" : "Current password"}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#3C8DBC] focus:ring-2 focus:ring-sky-100 px-3 pr-10 text-gray-900 text-sm transition-all shadow-xs"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#3C8DBC] focus:ring-2 focus:ring-sky-100 px-3 pr-10 text-gray-900 text-sm transition-all shadow-xs"
              />
              <button type="button" onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-medium">Must be at least 8 characters.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Confirm new password
            </label>
            <input
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#3C8DBC] focus:ring-2 focus:ring-sky-100 px-3 text-gray-900 text-sm transition-all shadow-xs"
            />
          </div>

          {error && (
            <div className="p-3 border border-rose-200 bg-rose-50 rounded-lg text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-6 bg-[#3C8DBC] hover:bg-[#357ca5] text-white font-bold text-xs rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? "Saving…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
