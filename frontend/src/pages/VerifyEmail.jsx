import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth.js";
import { api } from "@/services/api.js";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1, duration: 0.35 } },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 350, damping: 25 } },
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (code.trim().length !== 6) { setError("Enter the 6-digit verification code."); return; }
    setSubmitting(true);
    try {
      const updated = await api.verifyEmail(code.trim());
      setUser(updated);
      const role = updated?.role;
      if (role === "staff") navigate("/staff/dashboard/overview", { replace: true });
      else if (role === "admin") navigate("/admin/dashboard/overview", { replace: true });
      else navigate("/applicant/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    try {
      await api.resendVerifyCode();
      setCooldown(60);
    } catch (err) {
      if (err.body?.retryAfter) setCooldown(err.body.retryAfter);
      setError(err.message);
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
              Verify your email
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-2">
              We sent a 6-digit code to <span className="font-semibold text-gray-900">{user?.email || "your email"}</span>.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <motion.div variants={itemVariants}>
              <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full h-14 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white text-center text-2xl font-bold tracking-[0.4em] text-gray-900 transition-all font-mono"
                placeholder="······"
                autoFocus
              />
            </motion.div>

            {error && (
              <motion.div variants={itemVariants} className="flex items-start gap-2.5 p-3.5 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl text-rose-800 text-xs font-semibold shadow-2xs">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug flex-1">{error}</span>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={submitting || code.trim().length !== 6}
                className="w-full h-11 bg-[#1B2A4A] hover:bg-[#22355c] active:bg-[#15213b] text-white font-semibold text-sm rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Verify Account</span>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-6 border-t border-gray-100 pt-4 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Didn't receive code?{" "}
              {cooldown > 0 ? (
                <span className="text-gray-400 font-semibold">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-[#3C8DBC] font-bold hover:underline cursor-pointer"
                >
                  Resend Code
                </button>
              )}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
