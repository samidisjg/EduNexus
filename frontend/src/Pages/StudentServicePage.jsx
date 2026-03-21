import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Label,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import { FaDatabase, FaSearch, FaUserGraduate } from "react-icons/fa";
import studentService from "../services/student.service";

const initialStudentForm = {
  studentId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  year: 1,
};

const StudentServicePage = () => {
  const [students, setStudents] = useState([]);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const [filters, setFilters] = useState({
    name: "",
    email: "",
  });

  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [studentIdLookup, setStudentIdLookup] = useState("");
  const [enrollData, setEnrollData] = useState({
    studentId: "",
    courseId: "",
  });
  const [enrollmentStudentId, setEnrollmentStudentId] = useState("");
  const [countCourseId, setCountCourseId] = useState("");

  const setLoading = (key, value) => {
    setActionLoading((prev) => ({ ...prev, [key]: value }));
  };

  const runAction = async (key, fn, successMessage) => {
    setLoading(key, true);
    setError("");
    setSuccess("");

    try {
      const response = await fn();
      setResponseData(response);
      setSuccess(successMessage);
      return response;
    } catch (actionError) {
      setError(actionError.message || "Request failed.");
      return null;
    } finally {
      setLoading(key, false);
    }
  };

  const extractArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.body)) return payload.body;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const handleGetStudents = async () => {
    const response = await runAction(
      "listStudents",
      () => studentService.getStudentList(filters),
      "Student list loaded."
    );

    if (response) {
      setStudents(extractArray(response));
    }
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();

    await runAction(
      "addStudent",
      () =>
        studentService.addStudent({
          ...studentForm,
          year: Number(studentForm.year),
        }),
      "Student added successfully."
    );

    setStudentForm(initialStudentForm);
  };

  const handleGetById = async () => {
    if (!studentIdLookup.trim()) {
      setError("Student ID is required.");
      return;
    }

    await runAction(
      "getById",
      () => studentService.getStudentById(studentIdLookup.trim()),
      "Student fetched by ID."
    );
  };

  const handleEnroll = async (event) => {
    event.preventDefault();

    if (!enrollData.studentId.trim() || !enrollData.courseId.trim()) {
      setError("Student ID and Course ID are required for enrollment.");
      return;
    }

    await runAction(
      "enroll",
      () =>
        studentService.enrollStudent(
          enrollData.studentId.trim(),
          enrollData.courseId.trim()
        ),
      "Enrollment request completed."
    );
  };

  const handleGetEnrollments = async () => {
    if (!enrollmentStudentId.trim()) {
      setError("Student ID is required to fetch enrollments.");
      return;
    }

    await runAction(
      "enrollments",
      () => studentService.getEnrollments(enrollmentStudentId.trim()),
      "Enrollments loaded."
    );
  };

  const handleCountByCourse = async () => {
    if (!countCourseId.trim()) {
      setError("Course ID is required.");
      return;
    }

    await runAction(
      "courseCount",
      () => studentService.getStudentCountByCourse(countCourseId.trim()),
      "Student count loaded."
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-cyan-50 px-4 py-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">
                Student Service
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                API Test Console
              </h1>
            </div>
            <Badge color="info" className="px-3 py-1">
              POSTMAN-ALIGNED UI
            </Badge>
          </div>

          {error ? <Alert color="failure" className="mt-4">{error}</Alert> : null}
          {success ? <Alert color="success" className="mt-4">{success}</Alert> : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <FaSearch /> List / Filter Students
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label value="Name Filter" />
                <TextInput
                  value={filters.name}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Kavindu Perera"
                />
              </div>
              <div>
                <Label value="Email Filter" />
                <TextInput
                  value={filters.email}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="kavindu.perera@sliit.lk"
                />
              </div>
            </div>
            <Button onClick={handleGetStudents} disabled={actionLoading.listStudents}>
              {actionLoading.listStudents ? <Spinner size="sm" /> : "Get Student List"}
            </Button>
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <FaUserGraduate /> Get Student By ID
            </h2>
            <Label value="Student ID" />
            <TextInput
              value={studentIdLookup}
              onChange={(event) => setStudentIdLookup(event.target.value)}
              placeholder="STU-2026-0001"
            />
            <Button onClick={handleGetById} disabled={actionLoading.getById}>
              {actionLoading.getById ? <Spinner size="sm" /> : "Fetch Student"}
            </Button>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <FaDatabase /> Add Student
            </h2>
            <form onSubmit={handleAddStudent} className="grid gap-3 md:grid-cols-3">
              <div>
                <Label value="Student ID" />
                <TextInput
                  value={studentForm.studentId}
                  onChange={(event) =>
                    setStudentForm((prev) => ({ ...prev, studentId: event.target.value }))
                  }
                  placeholder="STU-2026-0001"
                  required
                />
              </div>
              <div>
                <Label value="Name" />
                <TextInput
                  value={studentForm.name}
                  onChange={(event) =>
                    setStudentForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Kavindu Perera"
                  required
                />
              </div>
              <div>
                <Label value="Email" />
                <TextInput
                  type="email"
                  value={studentForm.email}
                  onChange={(event) =>
                    setStudentForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="kavindu.perera@sliit.lk"
                  required
                />
              </div>
              <div>
                <Label value="Phone" />
                <TextInput
                  value={studentForm.phone}
                  onChange={(event) =>
                    setStudentForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="+94771234567"
                  required
                />
              </div>
              <div>
                <Label value="Department" />
                <TextInput
                  value={studentForm.department}
                  onChange={(event) =>
                    setStudentForm((prev) => ({ ...prev, department: event.target.value }))
                  }
                  placeholder="Computer Science"
                  required
                />
              </div>
              <div>
                <Label value="Year" />
                <TextInput
                  type="number"
                  min={1}
                  max={6}
                  value={studentForm.year}
                  onChange={(event) =>
                    setStudentForm((prev) => ({ ...prev, year: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="md:col-span-3">
                <Button type="submit" disabled={actionLoading.addStudent}>
                  {actionLoading.addStudent ? <Spinner size="sm" /> : "Create Student"}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              Student Enroll Request
            </h2>
            <form onSubmit={handleEnroll} className="space-y-3">
              <div>
                <Label value="Student ID" />
                <TextInput
                  value={enrollData.studentId}
                  onChange={(event) =>
                    setEnrollData((prev) => ({ ...prev, studentId: event.target.value }))
                  }
                  placeholder="STU-2026-0001"
                  required
                />
              </div>
              <div>
                <Label value="Course ID" />
                <TextInput
                  value={enrollData.courseId}
                  onChange={(event) =>
                    setEnrollData((prev) => ({ ...prev, courseId: event.target.value }))
                  }
                  placeholder="CS105"
                  required
                />
              </div>
              <Button type="submit" disabled={actionLoading.enroll}>
                {actionLoading.enroll ? <Spinner size="sm" /> : "Enroll Student"}
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              Get Enrollments by Student
            </h2>
            <div className="space-y-3">
              <div>
                <Label value="Student ID" />
                <TextInput
                  value={enrollmentStudentId}
                  onChange={(event) => setEnrollmentStudentId(event.target.value)}
                  placeholder="STU-2026-0001"
                />
              </div>
              <Button onClick={handleGetEnrollments} disabled={actionLoading.enrollments}>
                {actionLoading.enrollments ? <Spinner size="sm" /> : "Get Enrollments"}
              </Button>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              Internal Count by Course
            </h2>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <TextInput
                value={countCourseId}
                onChange={(event) => setCountCourseId(event.target.value)}
                placeholder="CS105"
              />
              <Button onClick={handleCountByCourse} disabled={actionLoading.courseCount}>
                {actionLoading.courseCount ? <Spinner size="sm" /> : "Get Count"}
              </Button>
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
            Students Table
          </h2>
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Student ID</Table.HeadCell>
                <Table.HeadCell>Name</Table.HeadCell>
                <Table.HeadCell>Email</Table.HeadCell>
                <Table.HeadCell>Phone</Table.HeadCell>
                <Table.HeadCell>Department</Table.HeadCell>
                <Table.HeadCell>Year</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <Table.Row key={student.studentId || index}>
                      <Table.Cell>{student.studentId || "-"}</Table.Cell>
                      <Table.Cell>{student.name || "-"}</Table.Cell>
                      <Table.Cell>{student.email || "-"}</Table.Cell>
                      <Table.Cell>{student.phone || "-"}</Table.Cell>
                      <Table.Cell>{student.department || "-"}</Table.Cell>
                      <Table.Cell>{student.year || "-"}</Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={6} className="text-center text-slate-500">
                      No student data loaded yet.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
            Raw API Response
          </h2>
          <pre className="max-h-80 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
            {responseData ? JSON.stringify(responseData, null, 2) : "No response yet."}
          </pre>
        </Card>
      </div>
    </div>
  );
};

export default StudentServicePage;
