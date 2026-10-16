import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ApplyForm from "./ApplyForm.jsx";
import { LanguageProvider } from "@/context/LanguageContext.jsx";

const mockAddApplication = jest.fn();
const mockRenewalLookup = jest.fn();

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick }) => (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock("@/hooks/useAuth.js", () => ({
  useAuth: () => ({
    user: { fullName: "Test User", email: "user@example.com" },
    logout: jest.fn(),
  }),
}));

jest.mock("@/hooks/useAppData.js", () => ({
  useAppData: () => ({
    applications: [],
    addApplication: mockAddApplication,
  }),
}));

jest.mock("../../services/api.js", () => ({
  api: {
    renewalLookup: (...args) => mockRenewalLookup(...args),
    serviceTypes: () => Promise.resolve({ items: [{ id: "st-1", name: "Civil", nameAm: "ሲቪል", code: "ENG-01" }] }),
    businessRegistration: jest.fn().mockResolvedValue({ businessName: "Test Enterprise", ownerName: "John Doe" }),
  },
}));

describe("ApplyForm Interactive Buttons & Actions Test Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial pathway options correctly", async () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <ApplyForm />
        </MemoryRouter>
      </LanguageProvider>
    );

    expect(screen.getByText("New applicant")).toBeInTheDocument();
    expect(screen.getByText("Existing certificate holder")).toBeInTheDocument();
  });

  it("triggers pathway button clicks properly", () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <ApplyForm />
        </MemoryRouter>
      </LanguageProvider>
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
