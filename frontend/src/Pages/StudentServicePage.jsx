import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Badge,
  Button,
  Card,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
  Tooltip,
} from "flowbite-react";
import {
  LuArrowDownUp,
  LuArrowLeft,
  LuArrowRight,
  LuBookOpen,
  LuCalendarClock,
  LuFilter,
  LuGraduationCap,
  LuListFilter,
  LuMail,
  LuPhone,
  LuRefreshCcw,
  LuSearch,
  LuUserPlus,
  LuUsers,
  LuView,
  LuX,
} from "react-icons/lu";
import studentService from "../services/student.service";

const initialStudentForm = {
  studentId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  year: 1,
};

const initialFilters = {
  search: "",
  department: "",
  year: "",
  page: 0,
  size: 10,
  sortBy: "createdAt",
  sortDir: "desc",
};

const studentColumns = [
  { key: "studentId", label: "Student ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "department", label: "Department" },
  { key: "year", label: "Year" },
  { key: "createdAt", label: "Admission Date" },
];

const listPriorityKeys = ["students", "enrollments", "content", "items", "results"];
const sortByOptions = ["createdAt", "name", "studentId", "department", "year"];
const sortDirOptions = ["asc", "desc"];

const SummaryCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="rounded-xl bg-slate-50 p-2 text-slate-700 shadow-inner dark:bg-slate-800 dark:text-slate-200">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
};

const StudentTableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(7)].map((_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-8 gap-3">
        {[...Array(8)].map((__, cellIndex) => (
          <div
            key={`${rowIndex}-${cellIndex}`}
            className="h-9 animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-700/70"
          />
        ))}
      </div>
    ))}
  </div>
);

const StudentServicePage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentIdForEnrollments, setSelectedStudentIdForEnrollments] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentColumns, setEnrollmentColumns] = useState([]);

  const [filters, setFilters] = useState(initialFilters);
  const [pageMeta, setPageMeta] = useState({
    page: 0,
    size: 10,
    totalPages: 1,
    totalElements: 0,
  });

  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEnrollPanel, setShowEnrollPanel] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);

  const [enrollData, setEnrollData] = useState({ studentId: "", courseId: "" });
  const [availableSeats, setAvailableSeats] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const setLoading = (key, value) => {
    setActionLoading((prev) => ({ ...prev, [key]: value }));
  };

  const runAction = async (key, fn, successMessage) => {
    setLoading(key, true);
    setError("");
    setSuccess("");

    try {
      const response = await fn();
      if (successMessage) setSuccess(successMessage);
      return response;
    } catch (actionError) {
      setError(actionError.message || "Request failed.");
      return null;
    } finally {
      setLoading(key, false);
    }
  };

  const normalizeRows = (payload) => {
    const data = payload?.body ?? payload?.data ?? payload;
    if (Array.isArray(data)) return data;

    if (data && typeof data === "object") {
      for (const key of listPriorityKeys) {
        if (Array.isArray(data[key])) return data[key];
      }
      const firstArray = Object.values(data).find((value) => Array.isArray(value));
      if (Array.isArray(firstArray)) return firstArray;
      return [data];
    }

    return [];
  };

  const normalizeObject = (payload) => {
    const data = payload?.body ?? payload?.data ?? payload;
    if (data && typeof data === "object" && !Array.isArray(data)) return data;
    const rows = normalizeRows(payload);
    return rows[0] || null;
  };

  const normalizePagination = (payload, fallbackRowsLength, requestedFilters) => {
    const data = payload?.body ?? payload?.data ?? payload;
    const page = Number(data?.page ?? requestedFilters?.page ?? 0);
    const size = Number(data?.size ?? requestedFilters?.size ?? 10);
    const totalPages = Number(data?.totalPages ?? 1);
    const totalElements = Number(data?.totalElements ?? fallbackRowsLength ?? 0);

    return {
      page: Number.isNaN(page) ? 0 : page,
      size: Number.isNaN(size) ? 10 : size,
      totalPages: Number.isNaN(totalPages) || totalPages < 1 ? 1 : totalPages,
      totalElements: Number.isNaN(totalElements) ? fallbackRowsLength : totalElements,
    };
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === "") return "-";

    if (key === "createdAt") {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date.toLocaleString();
    }

    if (typeof value === "string" && key.toLowerCase().includes("date")) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date.toLocaleString();
    }

    if (typeof value === "object") return JSON.stringify(value);
    return value;
  };

  const formatDepartmentTone = (department) => {
    const value = `${department || ""}`.toLowerCase();
    if (value.includes("computer")) return "info";
    if (value.includes("engineering")) return "purple";
    if (value.includes("business")) return "success";
    return "gray";
  };

  const getInitials = (name) => {
    if (!name) return "ST";
    const words = name.split(" ").filter(Boolean);
    return `${words[0]?.[0] || ""}${words[1]?.[0] || ""}`.toUpperCase();
  };

  const getSeatsFromPayload = (payload) => {
    const data = payload?.body ?? payload?.data ?? payload;
    if (!data || typeof data !== "object") return null;

    const seatKeys = ["availableSeats", "remainingSeats", "seatsAvailable", "available"];
    for (const key of seatKeys) {
      if (typeof data[key] === "number") return data[key];
      if (typeof data[key] === "string" && data[key].trim() !== "" && !Number.isNaN(Number(data[key]))) {
        return Number(data[key]);
      }
    }
    return null;
  };

  const handleGetStudents = async (appliedFilters = filters, silent = false) => {
    const response = await runAction(
      "listStudents",
      () => studentService.getStudentList(appliedFilters),
      silent ? "" : "Student list updated."
    );

    if (!response) return;

    const rows = normalizeRows(response);
    const pagination = normalizePagination(response, rows.length, appliedFilters);
    setStudents(rows);
    setPageMeta(pagination);
    setFilters((prev) => ({
      ...prev,
      page: pagination.page,
      size: pagination.size,
      sortBy: appliedFilters.sortBy ?? prev.sortBy,
      sortDir: appliedFilters.sortDir ?? prev.sortDir,
    }));
  };

  useEffect(() => {
    const loadInitialStudents = async () => {
      setLoading("listStudents", true);
      setError("");
      setSuccess("");

      try {
        const response = await studentService.getStudentList(initialFilters);
        const rows = normalizeRows(response);
        const pagination = normalizePagination(response, rows.length, initialFilters);
        setStudents(rows);
        setPageMeta(pagination);
        setFilters((prev) => ({
          ...prev,
          page: pagination.page,
          size: pagination.size,
          sortBy: initialFilters.sortBy ?? prev.sortBy,
          sortDir: initialFilters.sortDir ?? prev.sortDir,
        }));
      } catch (actionError) {
        setError(actionError.message || "Request failed.");
      } finally {
        setLoading("listStudents", false);
      }
    };

    loadInitialStudents();
  }, []);

  const handleFilterStudents = () => {
    const nextFilters = {
      ...filters,
      page: 0,
      size: Number(filters.size) || 10,
    };
    setFilters(nextFilters);
    handleGetStudents(nextFilters);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    handleGetStudents(initialFilters);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 0 || nextPage >= pageMeta.totalPages) return;
    const nextFilters = { ...filters, page: nextPage };
    setFilters(nextFilters);
    handleGetStudents(nextFilters, true);
  };

  const removeFilterChip = (key) => {
    const cleared = { ...filters, [key]: key === "year" ? "" : "", page: 0 };
    setFilters(cleared);
    handleGetStudents(cleared, true);
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();
    const response = await runAction(
      "addStudent",
      () => studentService.addStudent({ ...studentForm, year: Number(studentForm.year) }),
      "Student added successfully."
    );

    if (!response) return;

    setStudentForm(initialStudentForm);
    setShowAddStudentModal(false);
    handleGetStudents(filters, true);
  };

  const handleViewStudent = async (studentId) => {
    const response = await runAction(
      "viewStudent",
      () => studentService.getStudentById(studentId),
      "Student details loaded."
    );

    if (!response) return;
    setSelectedStudent(normalizeObject(response));
    setShowStudentModal(true);
  };

  const handleViewEnrollments = async (studentId) => {
    const response = await runAction(
      "viewEnrollments",
      () => studentService.getEnrollments(studentId),
      "Enrolled courses loaded."
    );

    if (!response) return;

    const rows = normalizeRows(response);
    const columnsSet = new Set();
    rows.forEach((row) => {
      if (row && typeof row === "object") {
        Object.keys(row).forEach((key) => columnsSet.add(key));
      }
    });

    setSelectedStudentIdForEnrollments(studentId);
    setEnrollments(rows);
    setEnrollmentColumns([...columnsSet]);
    setShowEnrollPanel(false);
    setEnrollData({ studentId, courseId: "" });
    setAvailableSeats(null);
    setShowEnrollmentsModal(true);
  };

  const handleCheckAvailableSeats = async () => {
    if (!enrollData.courseId.trim()) {
      setError("Course ID is required.");
      return;
    }

    const response = await runAction(
      "checkSeats",
      () => studentService.getCourseAvailability(enrollData.courseId.trim()),
      "Available seats checked."
    );

    if (!response) return;
    const seats = getSeatsFromPayload(response);
    setAvailableSeats(seats);
  };

  const handleEnrollStudent = async () => {
    if (!enrollData.studentId.trim() || !enrollData.courseId.trim()) {
      setError("Student ID and Course ID are required.");
      return;
    }

    const response = await runAction(
      "enroll",
      () => studentService.enrollStudent(enrollData.studentId.trim(), enrollData.courseId.trim()),
      "Enrollment request completed."
    );

    if (!response) return;
    setShowEnrollPanel(false);
    handleViewEnrollments(enrollData.studentId.trim());
  };

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.search.trim()) chips.push({ key: "search", label: `Search: ${filters.search}` });
    if (filters.department.trim()) chips.push({ key: "department", label: `Department: ${filters.department}` });
    if (`${filters.year}`.trim()) chips.push({ key: "year", label: `Year: ${filters.year}` });
    return chips;
  }, [filters]);

  const summary = useMemo(() => {
    const departments = new Set(students.map((student) => student.department).filter(Boolean));
    const finalYear = students.filter((student) => Number(student.year) >= 4).length;
    const recentCount = students.filter((student) => {
      const d = new Date(student.createdAt);
      return !Number.isNaN(d.getTime()) && Date.now() - d.getTime() <= 1000 * 60 * 60 * 24 * 30;
    }).length;

    return {
      totalStudents: pageMeta.totalElements || students.length,
      departments: departments.size,
      finalYear,
      recentlyAdded: recentCount,
    };
  }, [students, pageMeta.totalElements]);

  const isListLoading = Boolean(actionLoading.listStudents);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                <LuGraduationCap size={14} />
                Student Workspace
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl">Students</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
                Manage student records, search profiles, and explore academic details with a modern university dashboard flow.
              </p>
            </div>
            <Button onClick={() => setShowAddStudentModal(true)} color="light" className="rounded-xl px-5 py-2.5 font-semibold">
              <LuUserPlus className="mr-2" />
              Add Student
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="Total Students" value={summary.totalStudents} subtitle="Across available pages" icon={LuUsers} />
            <SummaryCard title="Departments" value={summary.departments} subtitle="In current result set" icon={LuListFilter} />
            <SummaryCard title="Final Year" value={summary.finalYear} subtitle="Year 4 and above" icon={LuGraduationCap} />
            <SummaryCard title="Recently Added" value={summary.recentlyAdded} subtitle="Last 30 days" icon={LuCalendarClock} />
          </div>
        </section>

        <Card className="overflow-hidden rounded-3xl border border-slate-200/80 shadow-sm dark:border-slate-700">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-5 dark:from-slate-900 dark:to-slate-900">
            <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <LuFilter size={16} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filters & Sorting</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <Label value="Search" />
                <TextInput
                  icon={LuSearch}
                  value={filters.search}
                  onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                  placeholder="Search by name, email, or ID"
                />
              </div>
              <div>
                <Label value="Department" />
                <TextInput
                  value={filters.department}
                  onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div>
                <Label value="Year" />
                <Select
                  value={filters.year}
                  onChange={(event) => setFilters((prev) => ({ ...prev, year: event.target.value }))}
                >
                  <option value="">All Years</option>
                  {[1, 2, 3, 4, 5, 6].map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label value="Sort By" />
                <Select
                  value={filters.sortBy}
                  onChange={(event) => setFilters((prev) => ({ ...prev, sortBy: event.target.value }))}
                >
                  {sortByOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label value="Sort Direction" />
              <div className="grid grid-cols-2 gap-2">
                {sortDirOptions.map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, sortDir: dir }))}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        filters.sortDir === dir
                          ? "border-slate-700 bg-slate-700 text-white shadow"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {dir.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Tooltip content="Apply Filters">
                <Button onClick={handleFilterStudents} disabled={isListLoading} color="light" aria-label="Apply Filters">
                  {isListLoading ? <Spinner size="sm" /> : <LuFilter />}
                </Button>
              </Tooltip>
              <Tooltip content="Reset Filters">
                <Button color="light" onClick={handleResetFilters} disabled={isListLoading} aria-label="Reset Filters">
                  <LuRefreshCcw />
                </Button>
              </Tooltip>
            </div>

            {activeFilterChips.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeFilterChip(chip.key)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {chip.label} ×
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="overflow-hidden rounded-3xl border border-slate-200/80 shadow-lg dark:border-slate-700">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Student Records</h3>
              <p className="text-sm text-slate-500">
                Showing {students.length} records | Total {pageMeta.totalElements}
              </p>
            </div>
            <Badge color="info" className="px-3 py-1">
              Page {pageMeta.page + 1} / {pageMeta.totalPages}
            </Badge>
          </div>

          {isListLoading && students.length === 0 ? (
            <StudentTableSkeleton />
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center dark:border-slate-600 dark:bg-slate-800/40">
              <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
                <LuSearch size={28} />
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">No students match your filters</p>
              <p className="mt-1 text-sm text-slate-500">Try changing search, department, year, or sorting options.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <Table hoverable>
                  <Table.Head className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800">
                    {studentColumns.map((column) => (
                      <Table.HeadCell key={column.key}>{column.label}</Table.HeadCell>
                    ))}
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {students.map((student, index) => (
                      <Table.Row key={student.studentId || index} className="bg-white even:bg-slate-50/60 hover:bg-indigo-50/60 dark:bg-slate-900 dark:even:bg-slate-800/70 dark:hover:bg-slate-800">
                        <Table.Cell className="font-semibold text-slate-800 dark:text-slate-100">{student.studentId || "-"}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                          {getInitials(student.name)}
                        </div>
                            <span className="font-medium text-slate-800 dark:text-slate-100">{student.name || "-"}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <LuMail size={14} />
                            {student.email || "-"}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <LuPhone size={14} />
                            {student.phone || "-"}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={formatDepartmentTone(student.department)}>
                            {student.department || "-"}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color="purple">Year {student.year || "-"}</Badge>
                        </Table.Cell>
                        <Table.Cell className="text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <LuCalendarClock size={14} />
                            {formatValue("createdAt", student.createdAt)}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            <Tooltip content="View Student">
                              <Button
                                size="xs"
                                color="light"
                                onClick={() => handleViewStudent(student.studentId)}
                                disabled={actionLoading.viewStudent}
                              >
                                <LuView />
                              </Button>
                            </Tooltip>
                            <Tooltip content="View Academics / Enrollments">
                              <Button
                                size="xs"
                                color="light"
                                onClick={() => handleViewEnrollments(student.studentId)}
                                disabled={actionLoading.viewEnrollments}
                              >
                                <LuBookOpen />
                              </Button>
                            </Tooltip>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  Sorted by <span className="font-semibold">{filters.sortBy}</span> ({filters.sortDir.toUpperCase()})
                </p>
                <div className="flex items-center gap-2">
                  <Select
                    value={filters.size}
                    onChange={(event) => {
                      const nextFilters = { ...filters, size: Number(event.target.value), page: 0 };
                      setFilters(nextFilters);
                      handleGetStudents(nextFilters, true);
                    }}
                    className="min-w-24"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}/page
                      </option>
                    ))}
                  </Select>
                  <Tooltip content="Previous Page">
                    <Button
                      color="light"
                      onClick={() => handlePageChange(pageMeta.page - 1)}
                      disabled={isListLoading || pageMeta.page === 0}
                      aria-label="Previous Page"
                    >
                      <LuArrowLeft />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Next Page">
                    <Button
                      color="light"
                      onClick={() => handlePageChange(pageMeta.page + 1)}
                      disabled={isListLoading || pageMeta.page >= pageMeta.totalPages - 1}
                      aria-label="Next Page"
                    >
                      <LuArrowRight />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </>
          )}
        </Card>

        <Modal show={showAddStudentModal} size="4xl" onClose={() => setShowAddStudentModal(false)}>
          <Modal.Header>Add Student</Modal.Header>
          <Modal.Body>
            <form onSubmit={handleAddStudent} className="grid gap-3 md:grid-cols-2">
              <div>
                <Label value="Student ID" />
                <TextInput
                  value={studentForm.studentId}
                  onChange={(event) => setStudentForm((prev) => ({ ...prev, studentId: event.target.value }))}
                  placeholder="STU-2026-0001"
                  required
                />
              </div>
              <div>
                <Label value="Name" />
                <TextInput
                  value={studentForm.name}
                  onChange={(event) => setStudentForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Kavindu Perera"
                  required
                />
              </div>
              <div>
                <Label value="Email" />
                <TextInput
                  type="email"
                  value={studentForm.email}
                  onChange={(event) => setStudentForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="kavindu.perera@sliit.lk"
                  required
                />
              </div>
              <div>
                <Label value="Phone" />
                <TextInput
                  value={studentForm.phone}
                  onChange={(event) => setStudentForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="+9477xxxxxxx"
                  required
                />
              </div>
              <div>
                <Label value="Department" />
                <TextInput
                  value={studentForm.department}
                  onChange={(event) => setStudentForm((prev) => ({ ...prev, department: event.target.value }))}
                  placeholder="Computer Science"
                  required
                />
              </div>
              <div>
                <Label value="Year" />
                <Select
                  value={studentForm.year}
                  onChange={(event) => setStudentForm((prev) => ({ ...prev, year: Number(event.target.value) }))}
                >
                  {[1, 2, 3, 4, 5, 6].map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" color="light" disabled={actionLoading.addStudent}>
                  {actionLoading.addStudent ? <Spinner size="sm" /> : <><LuUserPlus className="mr-2" />Create Student</>}
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>

        <Modal show={showStudentModal} size="4xl" onClose={() => setShowStudentModal(false)}>
          <Modal.Header>Student Details</Modal.Header>
          <Modal.Body>
            {selectedStudent ? (
              <div className="grid gap-3 md:grid-cols-2">
                {studentColumns.map((column) => (
                  <div key={column.key} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {column.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatValue(column.key, selectedStudent[column.key])}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </Modal.Body>
        </Modal>

        <Modal show={showEnrollmentsModal} size="7xl" onClose={() => setShowEnrollmentsModal(false)}>
          <Modal.Header>Student Academics / Enrollments</Modal.Header>
          <Modal.Body>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Student ID: <span className="font-semibold">{selectedStudentIdForEnrollments || "-"}</span>
              </p>
              <Tooltip content="Enroll New Course">
                <Button color="light" onClick={() => setShowEnrollPanel((prev) => !prev)} aria-label="Enroll New Course">
                  <LuUserPlus />
                </Button>
              </Tooltip>
            </div>

            {showEnrollPanel ? (
              <div className="mb-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-700 dark:bg-cyan-950/30">
                <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Enroll Student to Course</h3>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <TextInput value={enrollData.studentId} readOnly />
                  <TextInput
                    value={enrollData.courseId}
                    onChange={(event) => {
                      setEnrollData((prev) => ({ ...prev, courseId: event.target.value }));
                      setAvailableSeats(null);
                    }}
                    placeholder="Course ID (e.g. CS105)"
                  />
                  <Tooltip content="Check Available Seats">
                    <Button color="light" onClick={handleCheckAvailableSeats} disabled={actionLoading.checkSeats} aria-label="Check Available Seats">
                      {actionLoading.checkSeats ? <Spinner size="sm" /> : <LuSearch />}
                    </Button>
                  </Tooltip>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Badge color="info">Available Seats: {availableSeats === null ? "N/A" : availableSeats}</Badge>
                  <Button
                    color="light"
                    onClick={handleEnrollStudent}
                    disabled={actionLoading.enroll || !enrollData.courseId.trim()}
                  >
                    {actionLoading.enroll ? <Spinner size="sm" /> : <>Enroll Student</>}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <Table hoverable>
                <Table.Head className="bg-slate-100 dark:bg-slate-800">
                  {enrollmentColumns.length > 0 ? (
                    enrollmentColumns.map((column) => (
                      <Table.HeadCell key={column}>
                        <span className="inline-flex items-center gap-1">
                          <LuArrowDownUp size={13} />
                          {column}
                        </span>
                      </Table.HeadCell>
                    ))
                  ) : (
                    <Table.HeadCell>Result</Table.HeadCell>
                  )}
                </Table.Head>
                <Table.Body className="divide-y">
                  {enrollments.length > 0 ? (
                    enrollments.map((row, index) => (
                      <Table.Row key={index}>
                        {enrollmentColumns.map((column) => (
                          <Table.Cell key={`${index}-${column}`}>{formatValue(column, row[column])}</Table.Cell>
                        ))}
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={Math.max(enrollmentColumns.length, 1)} className="text-center text-slate-500">
                        No enrollments found for this student.
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          </Modal.Body>
        </Modal>

        <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
          {error ? (
            <Alert color="failure">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm">{error}</span>
                <button type="button" onClick={() => setError("")} aria-label="Close Error">
                  <LuX />
                </button>
              </div>
            </Alert>
          ) : null}
          {success ? (
            <Alert color="success">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm">{success}</span>
                <button type="button" onClick={() => setSuccess("")} aria-label="Close Success">
                  <LuX />
                </button>
              </div>
            </Alert>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StudentServicePage;
