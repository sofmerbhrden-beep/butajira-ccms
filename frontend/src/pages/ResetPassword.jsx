import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/services/api.js";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1, duration: 0.35 } },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 350, damping: 25 } },
};

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F4F5F7] text-gray-900 font-sans">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 max-w-[420px] text-center w-full">
          <div className="w-12 h-12 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight">Invalid or Expired Link</h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
            This password reset link is invalid or has expired. Please request a new password reset link.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center h-10 px-5 bg-[#1B2A4A] hover:bg-[#22355c] text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
            >
              Request New Link
            </Link>
            <Link
              to="/auth/login"
              className="inline-flex items-center justify-center h-10 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    try {
      await api.resetPassword(token, password);
      navigate("/auth/login", { state: { message: "Password reset successful. You can now sign in with your new password." }, replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F4F5F7] text-gray-900 font-sans">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[440px]"
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-10">
          <motion.div variants={itemVariants} className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="/logo2.png" alt="Company Logo" className="h-9 sm:h-10 w-auto object-contain shrink-0" />
              <span className="text-base sm:text-lg font-bold tracking-wider text-slate-700 uppercase font-mono">CCMS Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-3">
              Set New Password
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Create a new secure password (min. 8 characters)
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="reset-new-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white px-3.5 pr-10 text-sm text-gray-900 transition-all"
                  placeholder="Min. 8 characters"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                id="reset-confirm-password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-11 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white px-3.5 text-sm text-gray-900 transition-all"
                placeholder="Re-enter password"
              />
            </motion.div>

            {error && (
              <motion.div variants={itemVariants} className="flex items-start gap-2.5 p-3.5 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl text-rose-800 text-xs font-semibold shadow-2xs">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug flex-1">{error}</span>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-[#1B2A4A] hover:bg-[#22355c] active:bg-[#15213b] text-white font-semibold text-sm rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-6 border-t border-gray-100 pt-4 text-center">
            <Link to="/auth/login" className="text-xs font-semibold text-[#3C8DBC] hover:underline">
              ← Back to Sign In
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
