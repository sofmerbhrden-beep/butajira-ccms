import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import LanguageToggle from "../components/LanguageToggle.jsx";
import { useLanguage } from "@/hooks/useLanguage.js";
import { api } from "@/services/api.js";
import { useAuth } from "@/hooks/useAuth.js";

const LOGIN_PATH = {
  applicant: "/auth/login",
  staff: "/auth/login",
  admin: "/auth/login",
};

const containerVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15, duration: 0.4 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 350, damping: 26 } },
};

export default function RegisterForm({ role: initialRole = "applicant" }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { register } = useAuth();

  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "", accessCode: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const needsCode = role === "staff" || role === "admin";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim()) return setError("Full Name / Username is required.");
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError(t("errorEmail"));
    if (!form.password || form.password.length < 8)
      return setError(t("errorPasswordMin"));
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (needsCode && !form.accessCode.trim()) return setError("Access code is required.");

    setSubmitting(true);
    try {
      await register({
        username: form.fullName.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        accessCode: form.accessCode.trim(),
        role,
      });

      if (role === "staff") {
        navigate("/staff/dashboard/overview", { replace: true });
      } else if (role === "admin") {
        navigate("/admin/dashboard/overview", { replace: true });
      } else {
        navigate("/verify-email", {
          replace: true,
          state: { email: form.email.trim() },
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex text-gray-900 overflow-hidden font-sans relative bg-[#F4F5F7]">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col justify-between p-12 text-white bg-[#1B2A4A] border-l border-slate-700/80 shrink-0 z-10 order-2 lg:order-2"
      >
        <div className="relative z-20 flex items-center gap-3">
          <img src="/logo2.png" alt="Company Logo" className="h-14 sm:h-16 w-auto object-contain shrink-0 drop-shadow-md" />
          <span className="text-base sm:text-lg font-bold tracking-wider text-slate-200 uppercase font-mono">CCMS Portal</span>
        </div>

        <div className="relative z-20 max-w-md mx-auto my-auto text-center flex flex-col items-center justify-center py-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight tracking-tight text-white font-sans text-center">
            {t("auth_registerLeftTitle")}
          </h2>
          <p className="text-slate-300 text-base leading-relaxed font-normal text-center">
            {t("auth_registerLeftDesc")}
          </p>
        </div>

        <div className="relative z-20 text-slate-400 text-xs font-mono text-center lg:text-right">
          {t("auth_footer", { year: new Date().getFullYear() })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col items-center justify-center relative px-4 sm:px-8 lg:px-16 pt-16 pb-12 overflow-y-auto w-full order-1 lg:order-1"
      >
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:right-10 z-20">
          <LanguageToggle light />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[460px] relative z-10 my-auto"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-10">
            <motion.div variants={itemVariants} className="mb-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-1.5">
                <img src="/logo2.png" alt="Company Logo" className="h-9 sm:h-10 w-auto object-contain shrink-0" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {t("auth_createAccount")}
                </h1>
              </div>
              <p className="text-xs text-gray-500 font-medium">Select your account type and fill in your details</p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-1.5 p-1 bg-gray-100 rounded-lg mb-6">
              {["applicant", "staff", "admin"].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setError("");
                    setForm({ fullName: "", email: "", password: "", confirm: "", accessCode: "" });
                  }}
                  className={`flex-1 py-2 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                    role === r
                      ? "bg-white text-[#3C8DBC] shadow-sm font-bold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t(`role_${r}`)}
                </button>
              ))}
            </motion.div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="reg-email"
                  autoComplete="username"
                  spellCheck={false}
                  value={form.email}
                  onChange={set("email")}
                  className="w-full h-11 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white px-3.5 text-sm text-gray-900 transition-all"
                  autoFocus
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="reg-fullName"
                  autoComplete="name"
                  spellCheck={false}
                  value={form.fullName}
                  onChange={set("fullName")}
                  className="w-full h-11 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white px-3.5 text-sm text-gray-900 transition-all"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    spellCheck={false}
                    value={form.password}
                    onChange={set("password")}
                    className="w-full h-11 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white pl-3.5 pr-10 text-sm text-gray-900 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  spellCheck={false}
                  value={form.confirm}
                  onChange={set("confirm")}
                  className="w-full h-11 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white px-3.5 text-sm text-gray-900 transition-all"
                />
              </motion.div>

              {needsCode && (
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider">
                    Access Code
                  </label>
                  <input
                    type="password"
                    spellCheck={false}
                    value={form.accessCode}
                    onChange={set("accessCode")}
                    className="w-full h-11 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white px-3.5 text-sm text-gray-900 transition-all"
                  />
                </motion.div>
              )}

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
                  className="w-full h-11 bg-[#3C8DBC] hover:bg-[#357ca5] text-white font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-6 border-t border-gray-100 pt-4 text-center">
              <p className="text-gray-500 text-xs font-medium">
                Already have an account?{" "}
                <Link to={LOGIN_PATH[role]} className="text-[#3C8DBC] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
