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
});
