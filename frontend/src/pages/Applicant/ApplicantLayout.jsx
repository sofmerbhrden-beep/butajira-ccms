import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import ApplicantNavbar from "../../components/applicant/ApplicantNavbar.jsx";
import ApplicantSidebar from "../../components/applicant/ApplicantSidebar.jsx";
import ApplicantFooter from "../../components/applicant/ApplicantFooter.jsx";

const MOBILE_BREAKPOINT = 768;

function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
}

export default function ApplicantLayout() {
  const [collapsed, setCollapsed] = useState(isMobileViewport);
  const wasMobile = useRef(isMobileViewport());
  const location = useLocation();

  useEffect(() => {
    function handleResize() {
      const mobileNow = isMobileViewport();
      if (mobileNow !== wasMobile.current) {
        wasMobile.current = mobileNow;
        setCollapsed(mobileNow);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#1A2226] text-white">
      <ApplicantNavbar onToggleSidebar={() => setCollapsed((c) => !c)} />
      <div className="flex-1 flex overflow-hidden">
        <ApplicantSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-[#D2D6DE] text-[#212121] flex flex-col">
            <div className="flex-1 p-3 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
            <ApplicantFooter />
          </main>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
