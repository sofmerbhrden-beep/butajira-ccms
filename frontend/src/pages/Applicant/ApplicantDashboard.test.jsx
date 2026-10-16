import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext.jsx";
import ApplicantDashboard from "./ApplicantDashboard.jsx";

const mockApplications = [
  {
    id: "APP-5001",
    status: "staff_review",
    submittedAt: "2026-08-10T10:00:00Z",
    serviceType: { name: "General Construction", nameAm: "ጠቅላላ ግንባታ" },
  },
  {
    id: "APP-5002",
    status: "staff_rejected",
    submittedAt: "2026-08-11T12:00:00Z",
    serviceType: "Electrical Engineering",
    staffDecision: { decision: "rejected", reason: "Missing trade license copy" },
  },
  {
    id: "APP-5003",
    status: "certificate_generated",
    submittedAt: "2026-08-12T14:00:00Z",
    serviceType: { name: "Plumbing Services", nameAm: "የቧንቧ አገልግሎት" },
    certificate: { referenceNumber: "REF-998877" },
  },
  {
    id: "APP-5004",
    status: "admin_rejected",
    submittedAt: "2026-08-13T09:00:00Z",
    serviceType: "Architectural Design",
    adminDecision: { decision: "rejected", reason: "Invalid experience documentation" },
  },
];

let mockCurrentApplications = mockApplications;
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/hooks/useAppData.js", () => ({
  useAppData: () => ({
    applications: mockCurrentApplications,
  }),
}));

jest.mock("@/hooks/useAuth.js", () => ({
  useAuth: () => ({
    user: { fullName: "Abebe Bikila", email: "abebe@example.com" },
  }),
}));

function renderWithProviders(ui) {
  return render(
    <LanguageProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </LanguageProvider>
  );
}

describe("ApplicantDashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentApplications = mockApplications;
  });

  it("renders welcome banner with applicant name", () => {
    renderWithProviders(<ApplicantDashboard />);

    expect(screen.getByText(/Welcome Abebe Bikila/i)).toBeInTheDocument();
  });

  it("renders application records and progress trackers", () => {
    renderWithProviders(<ApplicantDashboard />);

    expect(screen.getByText("APP-5001")).toBeInTheDocument();
    expect(screen.getByText("General Construction")).toBeInTheDocument();

    expect(screen.getByText("APP-5002")).toBeInTheDocument();
    expect(screen.getByText("Electrical Engineering")).toBeInTheDocument();
    expect(screen.getByText("Missing trade license copy")).toBeInTheDocument();

    expect(screen.getByText("APP-5003")).toBeInTheDocument();
    expect(screen.getByText("Ref: REF-998877")).toBeInTheDocument();
    expect(screen.getByText(/Official Certificate Issued/i)).toBeInTheDocument();
  });

  it("renders admin feedback when application is rejected by admin", () => {
    renderWithProviders(<ApplicantDashboard />);

    expect(screen.getByText("APP-5004")).toBeInTheDocument();
    expect(screen.getByText("Invalid experience documentation")).toBeInTheDocument();
  });

  it("renders empty state when applicant has zero applications", () => {
    mockCurrentApplications = [];
    renderWithProviders(<ApplicantDashboard />);

    expect(screen.getByText("You haven't submitted an application yet.")).toBeInTheDocument();
  });

  it("navigates to application form when Start Application button is clicked", () => {
    renderWithProviders(<ApplicantDashboard />);

    const startBtn = screen.getAllByRole("button", { name: /Start an application/i })[0];
    fireEvent.click(startBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/applicant/apply");
  });
});
