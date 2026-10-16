import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Settings,
  ChevronUp,
  Mail,
  Camera,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar.jsx";
import { useAuth } from "@/hooks/useAuth.js";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function settingsPath(role) {
  if (role === "admin") return "/admin/settings";
  if (role === "staff") return "/staff/settings/password";
  return null;
}

export default function ProfileMenu({ collapsed }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [customPhoto, setCustomPhoto] = useState(() => {
    if (!user?.username) return null;
    return localStorage.getItem(`profile_photo_${user.username}`);
  });

  const avatarUrl = customPhoto || null;

  useEffect(() => {
    if (!user?.username) return;
    const stored = localStorage.getItem(`profile_photo_${user.username}`);
    setCustomPhoto(stored);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !user?.username) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      localStorage.setItem(`profile_photo_${user.username}`, dataUrl);
      setCustomPhoto(dataUrl);
      window.dispatchEvent(new Event("profile_photo_updated"));
    };
    reader.readAsDataURL(file);
  }

  const LOGIN_PATH = {
    admin: "/auth/login",
    staff: "/auth/login",
    applicant: "/auth/login",
  };

  async function handleSignOut() {
    setOpen(false);
    const dest = LOGIN_PATH[user?.role] ?? "/auth/login";
    await logout();
    navigate(dest, { replace: true });
  }

  const displayName = user?.fullName || user?.username || "User";
  const username = user?.username || "";
  const email = user?.email || "";
  const role = user?.role || "applicant";
  const settings = settingsPath(role);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`group w-full flex items-center gap-2.5 rounded-none px-2 py-2 text-left transition-all hover:bg-white/[0.07] outline-none border-none cursor-pointer ${collapsed ? "justify-center" : ""}`}
      >
        <Avatar className="size-9 rounded-full border border-white/30 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} className="object-cover rounded-full" />}
          <AvatarFallback className="bg-[#3C8DBC] text-white text-xs font-bold rounded-full flex items-center justify-center h-full w-full">
            {initials(displayName) || username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-gray-200 group-hover:text-white truncate leading-tight">
                {displayName}
              </span>
            </span>
            <ChevronUp
              size={15}
              strokeWidth={2}
              className={`shrink-0 text-gray-400 group-hover:text-white transition-transform duration-200 ${open ? "rotate-0" : "rotate-180"}`}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}
            className="absolute bottom-full left-0 mb-2 w-64 rounded-lg overflow-hidden z-[999] border border-white/10 bg-[#1b1e22] text-white shadow-2xl"
          >
            <div className="p-5 flex flex-col items-center text-center">
              <Avatar className="size-20 sm:size-24 rounded-full border-2 border-slate-600/80 shadow-md mb-3">
                {avatarUrl && <AvatarImage src={avatarUrl} className="object-cover rounded-full" />}
                <AvatarFallback className="bg-[#3C8DBC] text-white text-xl sm:text-2xl font-bold rounded-full flex items-center justify-center h-full w-full">
                  {initials(displayName) || username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <label
                htmlFor="profile-photo-input"
                className="relative overflow-hidden inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-[#1B2A4A] hover:bg-[#253963] transition-colors px-3 py-1.5 rounded-md border border-slate-700/80 shadow-md cursor-pointer mb-3"
              >
                <img
                  src="/logo2.png"
                  alt="Watermark"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 opacity-[0.35] pointer-events-none select-none object-contain filter drop-shadow-md"
                />
                <Camera size={13} className="relative z-10 shrink-0 text-white" />
                <span className="relative z-10">Upload Photo</span>
              </label>
              <input
                id="profile-photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <p className="text-[15px] font-semibold text-white truncate max-w-full">
                {displayName}
              </p>
            </div>

            <div className="h-px bg-white/[0.08] mx-4" />

            {email && (
              <div className="px-4 py-3">
                <div className="flex items-center gap-2.5 text-gray-400 text-[11px] font-mono truncate">
                  <Mail size={13} className="shrink-0 text-gray-400" />
                  <span className="truncate">{email}</span>
                </div>
              </div>
            )}

            <div className="h-px bg-white/[0.08] mx-4" />

            <div className="p-2 space-y-1">
              {settings && (
                <button
                  onClick={() => {
                    navigate(settings);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors border-none outline-none cursor-pointer"
                >
                  <Settings size={16} strokeWidth={2} />
                  <span>Settings</span>
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors border-none outline-none cursor-pointer"
              >
                <LogOut size={16} strokeWidth={2} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
