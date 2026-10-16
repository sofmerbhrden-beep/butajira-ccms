import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

const mockApplications = [
  {
    id: "APP-101",
    status: "admin_review",
    applicationType: "new",
    submittedAt: "2026-08-10T10:00:00Z",
    applicant: { fullName: "Kassahun Fekade" },
    serviceType: { name: "Architectural Design" },
  },
  {
    id: "APP-102",
    status: "certificate_generated",
    applicationType: "renewal",
    submittedAt: "2026-08-01T10:00:00Z",
    applicant: { fullName: "Bethlehem Tadesse" },
    serviceType: { name: "Civil Engineering" },
  },
  {
    id: "APP-103",
    status: "admin_rejected",
    applicationType: "new",
    submittedAt: "2026-08-02T10:00:00Z",
    applicant: { fullName: "Dawit Wolde" },
    serviceType: { name: "Electrical Contracting" },
  },
  {
    id: "APP-104",
    status: "admin_review",
    applicationType: "new",
    submittedAt: "2026-08-03T10:00:00Z",
    applicant: { fullName: "Eleni Gebre" },
    serviceType: { name: "Plumbing Services" },
  },
  {
    id: "APP-105",
    status: "admin_review",
    applicationType: "renewal",
    submittedAt: "2026-08-04T10:00:00Z",
    applicant: { fullName: "Fikru Haile" },
    serviceType: { name: "Surveying" },
  },
  {
    id: "APP-106",
    status: "admin_review",
    applicationType: "new",
    submittedAt: "2026-08-05T10:00:00Z",
    applicant: { fullName: "Girma Assefa" },
    serviceType: { name: "General Construction" },
  },
];

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/hooks/useAppData.js", () => ({
  useAppData: () => ({
    applications: mockApplications,
  }),
}));

jest.mock("@/hooks/useAuth.js", () => ({
  useAuth: () => ({
    user: { fullName: "Admin User", role: "admin" },
  }),
}));

jest.mock("@/services/api.js", () => ({
  api: {
    getAnalytics: jest.fn().mockResolvedValue({
      trendData: [
        { name: "Mar", applications: 12 },
        { name: "Apr", applications: 19 },
      ],
      statusData: [
        { name: "Approved", value: 25 },
        { name: "Pending", value: 10 },
      ],
    }),
  },
}));

jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
  };
});

function renderWithProviders(ui, { initialEntries = ["/admin/dashboard"] } = {}) {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </LanguageProvider>
  );
}

describe("AdminDashboard Component Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dashboard header and overview statistics cards", () => {
    renderWithProviders(<AdminDashboard />);

    expect(screen.getByRole("heading", { name: "Admin Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Applications today")).toBeInTheDocument();
    expect(screen.getAllByText("Pending my review").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Certificates issued").length).toBeGreaterThan(0);
    expect(screen.getByText("Rejected")).toBeInTheDocument();

    // Pending count = 4 (APP-101, APP-104, APP-105, APP-106)
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders overview recent activity list when no query filter is active", () => {
    renderWithProviders(<AdminDashboard />);

    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("Kassahun Fekade")).toBeInTheDocument();
    expect(screen.getByText("Girma Assefa")).toBeInTheDocument();
  });

  it("navigates to application detail page when clicking an application row", () => {
    renderWithProviders(<AdminDashboard />);

    const appRow = screen.getByText("Kassahun Fekade");
    fireEvent.click(appRow);

    expect(mockNavigate).toHaveBeenCalledWith("/admin/application/APP-101");
  });

  it("filters applications when clicking filter buttons", () => {
    renderWithProviders(<AdminDashboard />, { initialEntries: ["/admin/dashboard?filter=admin_review"] });

    expect(screen.getByText("Kassahun Fekade")).toBeInTheDocument();
    expect(screen.getByText("Eleni Gebre")).toBeInTheDocument();
    expect(screen.queryByText("Bethlehem Tadesse")).not.toBeInTheDocument();
  });

  it("filters applications by application type (New / Renewal)", () => {
    renderWithProviders(<AdminDashboard />, { initialEntries: ["/admin/dashboard?filter=all"] });

    const renewalBtn = screen.getByRole("button", { name: "Renewal" });
    fireEvent.click(renewalBtn);

    expect(screen.getByText("Bethlehem Tadesse")).toBeInTheDocument();
    expect(screen.getByText("Fikru Haile")).toBeInTheDocument();
    expect(screen.queryByText("Kassahun Fekade")).not.toBeInTheDocument();
  });

  it("renders Analytics & System Reports when analytics filter is active", async () => {
    renderWithProviders(<AdminDashboard />, { initialEntries: ["/admin/dashboard?filter=analytics"] });

    expect(screen.getByText("Analytics & System Reports")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Applications (Last 6 Months)")).toBeInTheDocument();
      expect(screen.getByText("Status Distribution")).toBeInTheDocument();
    });
  });

  it("handles pagination controls correctly", () => {
    renderWithProviders(<AdminDashboard />, { initialEntries: ["/admin/dashboard?filter=all"] });

    expect(screen.getByText("Page")).toBeInTheDocument();
    expect(screen.getByText("of 2")).toBeInTheDocument();

    // On Page 1 (indices 0 to 4 sorted by date): APP-101, APP-106, APP-105, APP-104, APP-103
    expect(screen.getByText("Kassahun Fekade")).toBeInTheDocument();
    expect(screen.queryByText("Bethlehem Tadesse")).not.toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /Next/i });
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(nextBtn);

    // On Page 2 (index 5): APP-102 ("Bethlehem Tadesse")
    expect(screen.getByText("Bethlehem Tadesse")).toBeInTheDocument();
    expect(screen.queryByText("Kassahun Fekade")).not.toBeInTheDocument();

    const prevBtn = screen.getByRole("button", { name: /Prev/i });
    expect(prevBtn).not.toBeDisabled();

    fireEvent.click(prevBtn);
    expect(screen.getByText("Kassahun Fekade")).toBeInTheDocument();
  });
});
