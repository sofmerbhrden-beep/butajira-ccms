import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppDataProvider } from "./context/AppDataContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import LoginForm from "./pages/LoginForm.jsx";
import RegisterForm from "./pages/RegisterForm.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import StaffForgotPassword from "./pages/StaffForgotPassword.jsx";
import AdminForgotPassword from "./pages/AdminForgotPassword.jsx";
import ApplicantLayout from "./pages/Applicant/ApplicantLayout.jsx";
import ApplicantDashboard from "./pages/Applicant/ApplicantDashboard.jsx";
import ApplyForm from "./pages/Applicant/ApplyForm.jsx";
import StaffLayout from "./pages/Staff/StaffLayout.jsx";
import StaffOverview from "./pages/Staff/Dashboard/StaffOverview.jsx";
import StaffPending from "./pages/Staff/Dashboard/StaffPending.jsx";
import StaffApplicationsIndex from "./pages/Staff/Applications/StaffApplicationsIndex.jsx";
import StaffReview from "./pages/Staff/StaffReview.jsx";
import StaffAccountSettings from "./pages/Staff/StaffAccountSettings.jsx";
import AdminLayout from "./pages/Admin/AdminLayout.jsx";
import DashboardOverview from "./pages/Admin/Dashboard/DashboardOverview.jsx";
import DashboardAnalytics from "./pages/Admin/Dashboard/DashboardAnalytics.jsx";
import DashboardPending from "./pages/Admin/Dashboard/DashboardPending.jsx";
import ApplicationsIndex from "./pages/Admin/Applications/ApplicationsIndex.jsx";
import SettingsPage from "./pages/Admin/Settings/SettingsPage.jsx";
import AdminReview from "./pages/Admin/AdminReview.jsx";
import CertificatePrintPage from "./pages/Admin/CertificatePrintPage.jsx";
import ReportsPage from "./pages/Admin/Reports/ReportsPage.jsx";
import VerifyCertificate from "./pages/VerifyCertificate.jsx";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppDataProvider>
          <Routes>
            <Route path="/verify/:year/:seq" element={<VerifyCertificate />} />

            {}
            <Route
              path="/auth/login"
              element={<LoginForm role="applicant" />}
            />
            {}
            <Route
              path="/auth/register"
              element={<RegisterForm role="applicant" />}
            />
            {}
            <Route
              path="/"
              element={<Navigate to="/auth/login" replace />}
            />
            <Route
              path="/change-password"
              element={
                <RequireAuth>
                  <ChangePassword />
                </RequireAuth>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/staff-forgot-password" element={<StaffForgotPassword />} />
            <Route path="/admin-forgot-password" element={<AdminForgotPassword />} />

            <Route
              path="/applicant"
              element={
                <RequireAuth roles={["applicant"]}>
                  <ApplicantLayout />
                </RequireAuth>
              }
            >
              <Route path="dashboard" element={<ApplicantDashboard />} />
            </Route>
            <Route
              path="/applicant/apply"
              element={
                <RequireAuth roles={["applicant"]}>
                  <ApplyForm />
                </RequireAuth>
              }
            />

            <Route
              path="/staff"
              element={
                <RequireAuth roles={["staff"]}>
                  <StaffLayout />
                </RequireAuth>
              }
            >
              <Route
                index
                element={<Navigate to="dashboard/overview" replace />}
              />
              <Route
                path="dashboard"
                element={<Navigate to="overview" replace />}
              />
              <Route path="dashboard/overview" element={<StaffOverview />} />
              <Route path="dashboard/pending" element={<StaffPending />} />
              <Route path="applications" element={<StaffApplicationsIndex />} />
              <Route path="application/:id" element={<StaffReview />} />
              <Route
                path="settings/password"
                element={<StaffAccountSettings />}
              />
            </Route>

            <Route
              path="/admin"
              element={
                <RequireAuth roles={["admin"]}>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route
                path="dashboard"
                element={<Navigate to="overview" replace />}
              />
              <Route
                path="dashboard/overview"
                element={<DashboardOverview />}
              />
              <Route
                path="dashboard/analytics"
                element={<DashboardAnalytics />}
              />
              <Route path="dashboard/pending" element={<DashboardPending />} />
              <Route path="application" element={<ApplicationsIndex />} />
              <Route path="application/:id" element={<AdminReview />} />
              <Route path="certificate/:id/print" element={<CertificatePrintPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </AppDataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
