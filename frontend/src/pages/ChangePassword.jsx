import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth.js";
import { api } from "@/services/api.js";
import LanguageToggle from "../components/LanguageToggle.jsx";

const HOME_BY_ROLE = {
  applicant: "/applicant/dashboard",
  staff: "/staff/dashboard/overview",
  admin: "/admin/dashboard/overview",
};

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!currentPassword.trim()) { setError("Enter your temporary password."); return; }
    if (newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setSaving(true);
    try {
      await api.changePassword(user.id, currentPassword, newPassword);
      toast.success("Password updated. Welcome!");

      await login(user.username, newPassword);
      navigate(HOME_BY_ROLE[user.role] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A2226] px-4">
      <div className="w-full max-w-sm bg-paper-card p-8 shadow-xl">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">
          Required
        </p>
        <h1 className="font-serif text-[22px] text-[#212121] mb-2">Set your password</h1>
        <p className="font-sans text-[13px] text-gray-500 mb-6">
          Your account was created with a temporary password. Please set a new one to continue.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-gray-500 mb-1.5">
              Temporary password
            </label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-[13px] focus:border-[#3C8DBC] outline-none" />
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-gray-500 mb-1.5">
              New password
            </label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 pr-10 text-[13px] focus:border-[#3C8DBC] outline-none" />
              <button type="button" onClick={() => setShowNew((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3C8DBC]">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">At least 8 characters.</p>
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-gray-500 mb-1.5">
              Confirm new password
            </label>
            <input type={showNew ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-[13px] focus:border-[#3C8DBC] outline-none" />
          </div>

          {error && <p className="text-[12px] text-red-600">{error}</p>}

          <button type="submit" disabled={saving}
            className="w-full bg-[#3C8DBC] hover:bg-[#357ca5] text-white font-sans text-[13px] font-semibold uppercase py-2.5 disabled:opacity-60">
            {saving ? "Saving…" : "Set password & continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
