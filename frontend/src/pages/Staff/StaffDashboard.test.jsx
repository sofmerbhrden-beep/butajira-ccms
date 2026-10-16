import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext.jsx";
import StaffDashboard from "./StaffDashboard.jsx";

const mockApplications = [
  {
    id: "APP-1001",
    status: "staff_review",
    submittedAt: "2026-08-10T10:00:00Z",
    applicant: { fullName: "Abebe Bikila", phone: "0911000001" },
    serviceType: { name: "General Construction" },
  },
  {
    id: "APP-1002",
    status: "admin_review",
    submittedAt: "2026-08-11T12:00:00Z",
    applicant: { fullName: "Kebede Tassew", phone: "0911000002" },
    serviceType: { name: "Electrical Work" },
  },
  {
    id: "APP-1003",
    status: "staff_rejected",
    submittedAt: "2026-08-12T14:00:00Z",
    applicant: { fullName: "Tigist Haile", phone: "0911000003" },
    serviceType: { name: "Plumbing Services" },
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

function renderWithProviders(ui) {
  return render(
    <LanguageProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </LanguageProvider>
  );
}

describe("StaffDashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dashboard header and counts correctly", () => {
    renderWithProviders(<StaffDashboard />);

    expect(screen.getByText("Applications Queue")).toBeInTheDocument();
    expect(screen.getByText("Abebe Bikila")).toBeInTheDocument();
  });

  it("filters applications when search input is used", () => {
    renderWithProviders(<StaffDashboard />);

    const searchInput = screen.getByPlaceholderText(/Search name, phone, service/i);
    fireEvent.change(searchInput, { target: { value: "Kebede" } });

    // Since Kebede is admin_review and default filter is staff_review, switch filter to All
    const allButtons = screen.getAllByRole("button", { name: /All/i });
    fireEvent.click(allButtons[0]);

    expect(screen.getByText("Kebede Tassew")).toBeInTheDocument();
    expect(screen.queryByText("Tigist Haile")).not.toBeInTheDocument();
  });

  it("navigates to application detail page when clicking an application item", () => {
    renderWithProviders(<StaffDashboard />);

    const appRow = screen.getByText("Abebe Bikila").closest("button");
    fireEvent.click(appRow);

    expect(mockNavigate).toHaveBeenCalledWith("/staff/application/APP-1001");
  });
});
