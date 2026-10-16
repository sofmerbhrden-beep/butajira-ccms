import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { api } from "@/services/api.js";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1, duration: 0.35 } },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 350, damping: 25 } },
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email address is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    setSubmitting(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setSuccessMsg(res.message || "Password reset instructions have been sent to your email.");
      setDone(true);
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
          </motion.div>

          {done ? (
            <motion.div variants={itemVariants} className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">{successMsg}</p>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center h-10 px-6 bg-[#1B2A4A] hover:bg-[#22355c] text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
              >
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants} className="mb-6 text-center">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
                  Forgot Password?
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Enter your registered email address to receive password reset instructions.
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white px-3.5 text-sm text-gray-900 transition-all"
                    placeholder="e.g. user@example.com"
                    autoFocus
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
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} className="mt-6 border-t border-gray-100 pt-4 text-center">
                <Link to="/auth/login" className="text-xs font-semibold text-[#3C8DBC] hover:underline">
                  ← Back to Sign In
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
