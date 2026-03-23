import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import StaffCoursePage from "./StaffCoursePage";
import courseService from "../services/course.service";

vi.mock("../services/course.service", () => ({
  default: {
    getCourses: vi.fn(),
  },
}));

describe("StaffCoursePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads the faculty workspace and requests initial courses", async () => {
    courseService.getCourses.mockResolvedValue([
      { courseId: "CS101", name: "Intro", faculty: "FOC", capacity: 30, status: "ACTIVE" },
    ]);

    render(
      <MemoryRouter initialEntries={["/dashboard/staff/course/FOC"]}>
        <Routes>
          <Route path="/dashboard/staff/course/:facultyCode" element={<StaffCoursePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Faculty Workspace/i)).toBeInTheDocument();
    await waitFor(() => expect(courseService.getCourses).toHaveBeenCalled());
    expect(await screen.findByText("CS101")).toBeInTheDocument();
  });

  it("shows the empty state when no courses match the selected faculty", async () => {
    courseService.getCourses.mockResolvedValue([
      { courseId: "EE101", name: "Circuits", faculty: "FOE", capacity: 40, status: "ACTIVE" },
    ]);

    render(
      <MemoryRouter initialEntries={["/dashboard/staff/course/FOC"]}>
        <Routes>
          <Route path="/dashboard/staff/course/:facultyCode" element={<StaffCoursePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/No courses match the current view/i)).toBeInTheDocument();
    expect(screen.queryByText("EE101")).not.toBeInTheDocument();
  });

  it("shows the loading skeleton while the initial course request is pending", async () => {
    let resolveCourses;
    courseService.getCourses.mockReturnValue(
      new Promise((resolve) => {
        resolveCourses = resolve;
      })
    );

    render(
      <MemoryRouter initialEntries={["/dashboard/staff/course/FOC"]}>
        <Routes>
          <Route path="/dashboard/staff/course/:facultyCode" element={<StaffCoursePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(courseService.getCourses).toHaveBeenCalled());
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);

    resolveCourses([
      { courseId: "CS101", name: "Intro", faculty: "FOC", capacity: 30, status: "ACTIVE" },
    ]);

    expect(await screen.findByText("CS101")).toBeInTheDocument();
  });
});
