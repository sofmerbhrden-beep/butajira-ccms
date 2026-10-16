import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext.jsx";
import StaffReview from "./StaffReview.jsx";

const mockStaffDecide = jest.fn();
const mockGetById = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/hooks/useAppData.js", () => ({
  useAppData: () => ({
    getById: mockGetById,
    staffDecide: mockStaffDecide,
  }),
}));

function renderWithRoute(appId) {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={[`/staff/application/${appId}`]}>
        <Routes>
          <Route path="/staff/application/:id" element={<StaffReview />} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe("StaffReview Component Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStaffDecide.mockResolvedValue({ success: true });
  });

  it("renders non-existent application fallback message when getById returns null", () => {
    mockGetById.mockReturnValue(null);

    renderWithRoute("INVALID-ID");

    expect(screen.getByText(/Application not found/i)).toBeInTheDocument();
    expect(screen.getByText(/Back/i)).toBeInTheDocument();
  });

  it("renders applicant details and renewal badge when applicationType is renewal", () => {
    mockGetById.mockReturnValue({
      id: "APP-REN-001",
      status: "staff_review",
      applicationType: "renewal",
      renewalOf: "REF-100200",
      submittedAt: "2026-08-10T10:00:00Z",
      applicant: { fullName: "Bekele Gerba", gender: "male", phone: "0911223344", address: { region: "Oromia" } },
      serviceType: { name: "Highway Construction", code: "HC001" },
      hasTradeLicense: true,
      tin: "0011223344",
      businessName: "Gerba Trading",
      documents: {},
    });

    renderWithRoute("APP-REN-001");

    expect(screen.getByText(/Renewal Application/i)).toBeInTheDocument();
    expect(screen.getByText(/REF-100200/i)).toBeInTheDocument();
    expect(screen.getAllByText("Bekele Gerba")[0]).toBeInTheDocument();
    expect(screen.getByText("Gerba Trading")).toBeInTheDocument();
  });

  it("handles Staff Approval workflow when status is staff_review", async () => {
    mockGetById.mockReturnValue({
      id: "APP-STF-002",
      status: "staff_review",
      applicationType: "new",
      submittedAt: "2026-08-10T10:00:00Z",
      applicant: { fullName: "Fatuma Roba", gender: "female", phone: "0922334455" },
      serviceType: { name: "Building Contractor" },
      documents: {},
    });

    renderWithRoute("APP-STF-002");

    const approveBtn = screen.getByRole("button", { name: /Approve & Forward to Admin/i });
    fireEvent.click(approveBtn);

    expect(mockStaffDecide).toHaveBeenCalledWith("APP-STF-002", "approved", "");
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/staff/dashboard");
    });
  });

  it("handles Staff Rejection workflow requiring reason selection", async () => {
    mockGetById.mockReturnValue({
      id: "APP-STF-003",
      status: "staff_review",
      applicationType: "new",
      submittedAt: "2026-08-10T10:00:00Z",
      applicant: { fullName: "Girma Baresa", gender: "male", phone: "0933445566" },
      serviceType: { name: "Electrical Services" },
      documents: {},
    });

    renderWithRoute("APP-STF-003");

    const rejectBtn = screen.getByRole("button", { name: /Reject/i });
    fireEvent.click(rejectBtn);

    expect(screen.getByText("Missing education certificate")).toBeInTheDocument();

    const checkbox = screen.getByLabelText("Missing education certificate");
    fireEvent.click(checkbox);

    const confirmBtn = screen.getByRole("button", { name: /Confirm Rejection/i });
    expect(confirmBtn).not.toBeDisabled();

    fireEvent.click(confirmBtn);

    expect(mockStaffDecide).toHaveBeenCalledWith("APP-STF-003", "rejected", "Missing education certificate");
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/staff/dashboard");
    });
  });
});
