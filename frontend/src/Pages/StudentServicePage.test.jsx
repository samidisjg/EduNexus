import { render, screen, waitFor } from "@testing-library/react";
import StudentServicePage from "./StudentServicePage";
import studentService from "../services/student.service";

vi.mock("../services/student.service", () => ({
  default: {
    getStudentList: vi.fn(),
  },
}));

describe("StudentServicePage", () => {
  it("loads the initial student list", async () => {
    studentService.getStudentList.mockResolvedValue({
      body: {
        students: [
          {
            studentId: "STU1",
            name: "Sam",
            email: "sam@example.com",
            phone: "123",
            department: "CS",
            year: 1,
            createdAt: "2026-01-01T00:00:00Z",
          },
        ],
        totalPages: 1,
        totalElements: 1,
        page: 0,
        size: 10,
      },
    });

    render(<StudentServicePage />);

    await waitFor(() => expect(studentService.getStudentList).toHaveBeenCalled());
    expect(await screen.findByText("Sam")).toBeInTheDocument();
  });
});
