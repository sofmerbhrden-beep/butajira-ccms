import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext.jsx";
import LoginForm from "./LoginForm.jsx";
import RegisterForm from "./RegisterForm.jsx";

const mockLogin = jest.fn();
const mockLoginDemo = jest.fn();
const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/hooks/useAuth.js", () => ({
  useAuth: () => ({
    login: mockLogin,
    loginDemo: mockLoginDemo,
    register: mockRegister,
  }),
}));

function renderWithProviders(ui) {
  return render(
    <LanguageProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </LanguageProvider>
  );
}

describe("Authentication Pages (LoginForm & RegisterForm)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("LoginForm Component", () => {
    it("renders email and password inputs and sign-in button", () => {
      renderWithProviders(<LoginForm />);

      expect(screen.getByPlaceholderText("Email or Username")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
      expect(screen.queryByText(/Google/i)).not.toBeInTheDocument();
    });

    it("shows all role demo buttons and signs in when one is clicked", async () => {
      mockLoginDemo.mockResolvedValueOnce({ role: "applicant" });
      renderWithProviders(<LoginForm />);

      fireEvent.click(screen.getByRole("button", { name: "Demo Applicant" }));

      await waitFor(() => {
        expect(mockLoginDemo).toHaveBeenCalledWith("applicant");
        expect(mockNavigate).toHaveBeenCalledWith("/applicant/dashboard");
      });
      expect(screen.getByRole("button", { name: "Demo Staff" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Demo Admin" })).toBeInTheDocument();
    });

    it("shows the server error if demo access is disabled", async () => {
      mockLoginDemo.mockRejectedValueOnce(new Error("Demo logins are disabled on this server."));
      renderWithProviders(<LoginForm />);

      fireEvent.click(screen.getByRole("button", { name: "Demo Admin" }));

      expect(await screen.findByText("Demo logins are disabled on this server.")).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("shows error if email or password is empty", async () => {
      renderWithProviders(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: /Sign In/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Enter both a username and a password to continue.")).toBeInTheDocument();
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("shows error for invalid email format when @ symbol is present", async () => {
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("Email or Username");
      const passwordInput = document.querySelector("input[name='password']");

      fireEvent.change(emailInput, { target: { value: "invalidemail@" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      const submitButton = screen.getByRole("button", { name: /Sign In/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("allows plain username login without requiring @ symbol", async () => {
      mockLogin.mockResolvedValueOnce({ role: "admin" });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("Email or Username");
      const passwordInput = document.querySelector("input[name='password']");

      fireEvent.change(emailInput, { target: { value: "admin" } });
      fireEvent.change(passwordInput, { target: { value: "admin123" } });

      const submitButton = screen.getByRole("button", { name: /Sign In/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith("admin", "admin123");
        expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard/overview");
      });
    });

    it("calls login and navigates on valid applicant credentials", async () => {
      mockLogin.mockResolvedValueOnce({ role: "applicant" });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("Email or Username");
      const passwordInput = document.querySelector("input[name='password']");

      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      const submitButton = screen.getByRole("button", { name: /Sign In/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith("user@example.com", "password123");
        expect(mockNavigate).toHaveBeenCalledWith("/applicant/dashboard");
      });
    });

    it("navigates to staff overview when staff logs in", async () => {
      mockLogin.mockResolvedValueOnce({ role: "staff" });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("Email or Username");
      const passwordInput = document.querySelector("input[name='password']");

      fireEvent.change(emailInput, { target: { value: "staff@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/staff/dashboard/overview");
      });
    });

    it("toggles password visibility when eye button is clicked", () => {
      renderWithProviders(<LoginForm />);

      const passwordInput = document.querySelector("input[name='password']");
      expect(passwordInput).toHaveAttribute("type", "password");

      const toggleButton = passwordInput.nextElementSibling;
      fireEvent.click(toggleButton);

      expect(passwordInput).toHaveAttribute("type", "text");
    });
  });

  describe("RegisterForm Component", () => {
    it("renders registration inputs and role tabs", () => {
      renderWithProviders(<RegisterForm role="applicant" />);

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Username")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Create Account/i })).toBeInTheDocument();
      expect(screen.queryByText(/Google/i)).not.toBeInTheDocument();
    });

    it("requires access code when staff or admin role is selected", async () => {
      renderWithProviders(<RegisterForm role="applicant" />);

      const staffTab = screen.getByRole("button", { name: /Staff/i });
      fireEvent.click(staffTab);

      expect(screen.getByText("Access Code")).toBeInTheDocument();
    });

    it("enforces minimum 8 character password constraint", async () => {
      renderWithProviders(<RegisterForm role="applicant" />);

      const emailInput = document.querySelector("#reg-email");
      const nameInput = document.querySelector("#reg-fullName");
      const passwordInputs = document.querySelectorAll("input[autoComplete='new-password']");

      fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
      fireEvent.change(nameInput, { target: { value: "New User" } });
      fireEvent.change(passwordInputs[0], { target: { value: "short" } });
      fireEvent.change(passwordInputs[1], { target: { value: "short" } });

      fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

      await waitFor(() => {
        expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
      });
    });

    it("validates matching confirmation password", async () => {
      renderWithProviders(<RegisterForm role="applicant" />);

      const emailInput = document.querySelector("#reg-email");
      const nameInput = document.querySelector("#reg-fullName");
      const passwordInputs = document.querySelectorAll("input[autoComplete='new-password']");

      fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
      fireEvent.change(nameInput, { target: { value: "New User" } });
      fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
      fireEvent.change(passwordInputs[1], { target: { value: "mismatch654" } });

      fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
      });
    });

    it("registers applicant successfully and navigates to the applicant dashboard", async () => {
      mockRegister.mockResolvedValueOnce({ id: "user123" });

      renderWithProviders(<RegisterForm role="applicant" />);

      const emailInput = document.querySelector("#reg-email");
      const nameInput = document.querySelector("#reg-fullName");
      const passwordInputs = document.querySelectorAll("input[autoComplete='new-password']");

      fireEvent.change(emailInput, { target: { value: "applicant@example.com" } });
      fireEvent.change(nameInput, { target: { value: "Applicant Name" } });
      fireEvent.change(passwordInputs[0], { target: { value: "securepass123" } });
      fireEvent.change(passwordInputs[1], { target: { value: "securepass123" } });

      fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          username: "Applicant Name",
          fullName: "Applicant Name",
          email: "applicant@example.com",
          password: "securepass123",
          accessCode: "",
          role: "applicant",
        });
        expect(mockNavigate).toHaveBeenCalledWith("/applicant/dashboard", { replace: true });
      });
    });

    it("registers staff successfully and navigates to staff overview", async () => {
      mockRegister.mockResolvedValueOnce({ id: "staff123" });

      renderWithProviders(<RegisterForm role="staff" />);

      const emailInput = document.querySelector("#reg-email");
      const nameInput = document.querySelector("#reg-fullName");
      const passwordInputs = document.querySelectorAll("input[autoComplete='new-password']");
      const accessCodeInput = document.querySelector("input[type='password']:not([autoComplete])");

      fireEvent.change(emailInput, { target: { value: "staff@example.com" } });
      fireEvent.change(nameInput, { target: { value: "Staff Member" } });
      fireEvent.change(passwordInputs[0], { target: { value: "staffpass123" } });
      fireEvent.change(passwordInputs[1], { target: { value: "staffpass123" } });
      fireEvent.change(accessCodeInput, { target: { value: "SECRET_STAFF_CODE" } });

      fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          username: "Staff Member",
          fullName: "Staff Member",
          email: "staff@example.com",
          password: "staffpass123",
          accessCode: "SECRET_STAFF_CODE",
          role: "staff",
        });
        expect(mockNavigate).toHaveBeenCalledWith("/staff/dashboard/overview", { replace: true });
      });
    });
  });
});
