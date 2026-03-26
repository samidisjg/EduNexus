import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach } from "vitest";
import SideNav from "./SideNav";
import authService from "../services/auth.service";
import { signOutSuccess } from "../redux/user/userSlice";

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../services/auth.service", () => ({
  default: {
    signOut: vi.fn(),
  },
}));

describe("SideNav", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders nested dashboard links when expanded", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/staff/course/FOC"]}>
        <SideNav isOpen={true} onToggle={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /All Programs/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /FOC/i })).toBeInTheDocument();
  });

  it("toggles nested sections open and closed", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/staff/course"]}>
        <SideNav isOpen={true} onToggle={vi.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("button", { name: /All Programs/i })[0]);
    expect(screen.queryByRole("link", { name: /FOC/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /All Programs/i })[0]);
    expect(screen.getByRole("link", { name: /FOC/i })).toBeInTheDocument();
  });

  it("signs out and redirects to the sign-in page", () => {
    render(
      <MemoryRouter>
        <SideNav isOpen={true} onToggle={vi.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Sign Out/i }));

    expect(authService.signOut).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(signOutSuccess());
    expect(mockNavigate).toHaveBeenCalledWith("/sign-in");
  });
});