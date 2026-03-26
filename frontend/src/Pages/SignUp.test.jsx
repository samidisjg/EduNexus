import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignUp from "./SignUp";
import authService from "../services/auth.service";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../services/auth.service", () => ({
  default: {
    signUp: vi.fn(),
  },
}));

describe("SignUp page", () => {
  it("shows mismatch validation before calling the API", async () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "Sam" } });
    fireEvent.change(screen.getByPlaceholderText("your.email@university.edu"), {
      target: { value: "sam@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Create a strong password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
      target: { value: "different123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create your account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(authService.signUp).not.toHaveBeenCalled();
  });

  it("submits valid data and redirects on success", async () => {
    authService.signUp.mockResolvedValue({
      success: true,
      message: "ok",
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "Sam" } });
    fireEvent.change(screen.getByPlaceholderText("your.email@university.edu"), {
      target: { value: "sam@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Create a strong password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create your account/i }));

    await waitFor(() => {
      expect(authService.signUp).toHaveBeenCalledWith({
        userName: "Sam",
        userEmail: "sam@example.com",
        userPassword: "secret123",
        role: "USER",
      });
    });
  });
});
