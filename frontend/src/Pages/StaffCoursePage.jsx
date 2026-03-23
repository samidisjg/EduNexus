import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
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
  FaArrowLeft,
  FaBookOpen,
  FaChartLine,
  FaEdit,
  FaLayerGroup,
  FaPlusCircle,
  FaSearch,
  FaSignal,
  FaUniversity,
} from "react-icons/fa";
import { LuFilter, LuRefreshCcw, LuSearch, LuView, LuX } from "react-icons/lu";
import courseService from "../services/course.service";

const facultyOptions = [
  { value: "FOC", label: "FOC - Faculty of Computing" },
  { value: "FOE", label: "FOE - Faculty of Engineering" },
  { value: "FOM", label: "FOM - Faculty of Management" },
  { value: "FOH", label: "FOH - Faculty of Humanities" },
  { value: "FOA", label: "FOA - Faculty of Architecture" },
];

const facultyLabelMap = facultyOptions.reduce((map, faculty) => {
  map[faculty.value] = faculty.label;
  return map;
}, {});

const COURSE_SKELETON_ROWS = [
  "skeleton-row-1",
  "skeleton-row-2",
  "skeleton-row-3",
  "skeleton-row-4",
  "skeleton-row-5",
  "skeleton-row-6",
];

const COURSE_SKELETON_CELLS = [
  "course-id",
  "course-name",
  "course-term",
  "course-lic",
  "course-capacity",
  "course-status",
  "action-view",
  "action-capacity",
  "action-status",
];

const isCourseLike = (item) =>
  Boolean(item) &&
  typeof item === "object" &&
  ("courseId" in item ||
    "name" in item ||
    "capacity" in item ||
    "year" in item ||
    "semester" in item ||
    "lic" in item ||
    "faculty" in item ||
    "status" in item);

const unwrapCourse = (payload) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (isCourseLike(payload)) {
    return payload;
  }

  const nestedKeys = ["body", "data", "course", "result", "response"];

  for (const key of nestedKeys) {
    const nestedValue = payload[key];

    if (!nestedValue || typeof nestedValue !== "object") {
      continue;
    }

    const normalized = unwrapCourse(nestedValue);
    if (normalized) {
      return normalized;
    }
  }

  return null;
};

const extractArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload.filter(isCourseLike);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const nestedKeys = ["body", "data", "content", "courses", "items", "result", "response"];

  for (const key of nestedKeys) {
    const nestedValue = payload[key];

    if (Array.isArray(nestedValue)) {
      return nestedValue.filter(isCourseLike);
    }

    if (nestedValue && typeof nestedValue === "object") {
      const normalized = extractArray(nestedValue);
      if (normalized.length > 0) {
        return normalized;
      }
    }
  }

  return [];
};

const buildInitialCourseForm = (faculty = "FOC") => ({
  courseId: "",
  name: "",
  capacity: 30,
  year: 1,
  semester: 1,
  lic: "",
  faculty,
});

const initialCapacityForm = {
  courseId: "",
  capacity: 30,
};

const initialStatusForm = {
  courseId: "",
  status: "ACTIVE",
};

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

const CourseTableSkeleton = () => (
  <div className="space-y-3">
    {COURSE_SKELETON_ROWS.map((rowId) => (
      <div key={rowId} className="grid grid-cols-9 gap-3">
        {COURSE_SKELETON_CELLS.map((cellId) => (
          <div
            key={`${rowId}-${cellId}`}
            className="h-9 animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-700/70"
          />
        ))}
      </div>
    ))}
  </div>
);

const CourseEmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center dark:border-slate-600 dark:bg-slate-800/40">
    <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-200">
      <FaSearch size={24} />
    </div>
    <p className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">No courses match the current view</p>
    <p className="mt-1 text-sm text-slate-500">Try another search term or create a new course for this faculty.</p>
  </div>
);

const FloatingAlerts = ({ error, success, onDismissError, onDismissSuccess }) => (
  <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
    {error ? (
      <Alert color="failure">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">{error}</span>
          <button type="button" onClick={onDismissError} aria-label="Close Error">
            <LuX />
          </button>
        </div>
      </Alert>
    ) : null}
    {success ? (
      <Alert color="success">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">{success}</span>
          <button type="button" onClick={onDismissSuccess} aria-label="Close Success">
            <LuX />
          </button>
        </div>
      </Alert>
    ) : null}
  </div>
);

FloatingAlerts.propTypes = {
  error: PropTypes.string.isRequired,
  success: PropTypes.string.isRequired,
  onDismissError: PropTypes.func.isRequired,
  onDismissSuccess: PropTypes.func.isRequired,
};

const formatCourseOption = (course) => {
  const bits = [course.courseId, course.name].filter(Boolean);
  const academic = [];

  if (course.year) academic.push(`Y${course.year}`);
  if (course.semester) academic.push(`S${course.semester}`);

  if (academic.length > 0) {
    bits.push(`(${academic.join(" ")})`);
  }

  return bits.join(" - ").replace(" - (", " (");
};

const getStatusTone = (status) => (status === "ACTIVE" ? "success" : "warning");

const StaffCoursePage = () => {
  const navigate = useNavigate();
  const { facultyCode } = useParams();
  const selectedFaculty = facultyOptions.find((faculty) => faculty.value === facultyCode)?.value || null;

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [courseForm, setCourseForm] = useState(buildInitialCourseForm(selectedFaculty || "FOC"));
  const [courseIdLookup, setCourseIdLookup] = useState("");
  const [capacityForm, setCapacityForm] = useState(initialCapacityForm);
  const [statusForm, setStatusForm] = useState(initialStatusForm);
  const [selectedCourseResult, setSelectedCourseResult] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const setLoading = (key, value) => {
    setActionLoading((prev) => ({ ...prev, [key]: value }));
  };

  const runAction = async (key, fn, successMessage) => {
    setLoading(key, true);
    setError("");
    setSuccess("");

    try {
      const response = await fn();
      if (successMessage) {
        setSuccess(successMessage);
      }
      return response;
    } catch (actionError) {
      setError(actionError.message || "Request failed.");
      return null;
    } finally {
      setLoading(key, false);
    }
  };

  const upsertCourse = (course) => {
    const normalizedCourse = unwrapCourse(course);

    if (!normalizedCourse?.courseId) {
      return;
    }

    setCourses((prev) => {
      const exists = prev.some((item) => item.courseId === normalizedCourse.courseId);

      if (!exists) {
        return [normalizedCourse, ...prev];
      }

      return prev.map((item) =>
        item.courseId === normalizedCourse.courseId ? normalizedCourse : item
      );
    });
  };
  const handleLoadCourses = async (silent = false) => {
    const response = await runAction(
      "listCourses",
      () => courseService.getCourses(),
      silent ? "" : "Course list refreshed."
    );

    if (response) {
      setCourses(extractArray(response));
    }
  };

  useEffect(() => {
    const loadInitialCourses = async () => {
      setLoading("listCourses", true);
      setError("");
      setSuccess("");
      try {
        const response = await courseService.getCourses();
        setCourses(extractArray(response));
        setSuccess("Course list loaded.");
      } catch (actionError) {
        setError(actionError.message || "Request failed.");
      } finally {
        setLoading("listCourses", false);
      }
    };

    loadInitialCourses();
  }, []);

  useEffect(() => {
    setCourseForm(buildInitialCourseForm(selectedFaculty || "FOC"));
  }, [selectedFaculty]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = globalThis.setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => globalThis.clearTimeout(timer);
  }, [success]);

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    const response = await runAction(
      "createCourse",
      () =>
        courseService.createCourse({
          ...courseForm,
          faculty: selectedFaculty || courseForm.faculty,
          capacity: Number(courseForm.capacity),
          year: Number(courseForm.year),
          semester: Number(courseForm.semester),
        }),
      "Course created successfully."
    );

    if (response) {
      upsertCourse(response);
      setCourseForm(buildInitialCourseForm(selectedFaculty || "FOC"));
      setShowCreateModal(false);
    }
  };

  const handleGetCourseById = async (courseIdArg = courseIdLookup, openModal = true) => {
    if (!courseIdArg.trim()) {
      setError("Course ID is required.");
      return;
    }

    const courseId = courseIdArg.trim();
    const response = await runAction(
      "getCourseById",
      async () => {
        const [course, stats, availability] = await Promise.all([
          courseService.getCourseById(courseId),
          courseService.getCourseStats(courseId),
          courseService.getCourseAvailability(courseId),
        ]);

        return { course, stats, availability };
      },
      "Course details loaded."
    );

    if (response) {
      upsertCourse(response.course);
      setSelectedCourseResult(response);
      setCourseIdLookup(courseId);
      if (openModal) {
        setShowDetailsModal(true);
      }
    }
  };

  const handleUpdateCapacity = async (event) => {
    event.preventDefault();

    if (!capacityForm.courseId.trim()) {
      setError("Course ID is required to update capacity.");
      return;
    }

    const response = await runAction(
      "updateCapacity",
      () =>
        courseService.updateCourseCapacity(
          capacityForm.courseId.trim(),
          Number(capacityForm.capacity)
        ),
      "Course capacity updated."
    );

    if (response) {
      upsertCourse(response);
      setCapacityForm(initialCapacityForm);
      setShowCapacityModal(false);
    }
  };

  const handleUpdateStatus = async (event) => {
    event.preventDefault();

    if (!statusForm.courseId.trim()) {
      setError("Course ID is required to update status.");
      return;
    }

    const response = await runAction(
      "updateStatus",
      () =>
        courseService.updateCourseStatus(
          statusForm.courseId.trim(),
          statusForm.status
        ),
      "Course status updated."
    );

    if (response) {
      upsertCourse(response);
      setStatusForm(initialStatusForm);
      setShowStatusModal(false);
    }
  };

  const coursesByFaculty = useMemo(
    () =>
      facultyOptions.map((faculty) => {
        const facultyCourses = courses.filter((course) => course.faculty === faculty.value);
        const totalSeats = facultyCourses.reduce(
          (total, course) => total + Number(course.capacity || 0),
          0
        );
        const activeCount = facultyCourses.filter((course) => course.status === "ACTIVE").length;

        return {
          ...faculty,
          courses: facultyCourses,
          courseCount: facultyCourses.length,
          totalSeats,
          activeCount,
        };
      }),
    [courses]
  );

  const visibleCourses = selectedFaculty
    ? courses.filter((course) => course.faculty === selectedFaculty)
    : courses;

  const filteredCourses = visibleCourses.filter((course) => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return [course.courseId, course.name, course.faculty, course.status, course.lic]
      .concat([course.year, course.semester])
      .filter(Boolean)
      .some((value) => `${value}`.toLowerCase().includes(keyword));
  });

  const selectableCourses = [...visibleCourses].sort((left, right) =>
    (left.courseId || "").localeCompare(right.courseId || "")
  );

  const totalCourses = courses.length;
  const totalCapacity = courses.reduce(
    (total, course) => total + Number(course.capacity || 0),
    0
  );
  const activeCourses = courses.filter((course) => course.status === "ACTIVE").length;
  const inactiveCourses = courses.filter((course) => course.status === "INACTIVE").length;
  const isListLoading = Boolean(actionLoading.listCourses);

  const openCapacityModal = (course) => {
    setCapacityForm({
      courseId: course.courseId || "",
      capacity: Number(course.capacity || 0),
    });
    setShowCapacityModal(true);
  };

  const openStatusModal = (course) => {
    setStatusForm({
      courseId: course.courseId || "",
      status: course.status || "ACTIVE",
    });
    setShowStatusModal(true);
  };

  if (!selectedFaculty) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
                  <FaUniversity size={12} />
                  Staff Course Desk
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl">All Programs</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
                  Review program coverage, compare faculty capacity, and open a faculty workspace for direct course operations.
                </p>
              </div>
              <Button color="light" onClick={() => handleLoadCourses(false)} disabled={isListLoading} className="rounded-xl px-5 py-2.5 font-semibold">
                {isListLoading ? <Spinner size="sm" /> : <><LuRefreshCcw className="mr-2" />Refresh</>}
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard title="Faculties" value={facultyOptions.length} subtitle="Programs available in navigation" icon={FaUniversity} />
              <SummaryCard title="Total Courses" value={totalCourses} subtitle="Across all faculties" icon={FaLayerGroup} />
              <SummaryCard title="Seat Capacity" value={totalCapacity} subtitle="Combined course intake" icon={FaChartLine} />
              <SummaryCard title="Active Courses" value={activeCourses} subtitle={`${inactiveCourses} inactive courses`} icon={FaSignal} />
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            {coursesByFaculty.map((faculty) => (
              <Card key={faculty.value} className="overflow-hidden rounded-3xl border border-slate-200/80 shadow-sm dark:border-slate-700">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-5 dark:from-slate-900 dark:to-slate-900">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">{faculty.value}</p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                        {faculty.label.replace(`${faculty.value} - `, "")}
                      </h2>
                    </div>
                    <Badge color="info" className="px-3 py-1">{faculty.courseCount} Courses</Badge>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Seats</p>
                      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{faculty.totalSeats}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Active</p>
                      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{faculty.activeCount}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Inactive</p>
                      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{faculty.courseCount - faculty.activeCount}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Open the faculty workspace to create, inspect, and update courses.
                    </p>
                    <Button onClick={() => navigate(`/dashboard/staff/course/${faculty.value}`)} color="light">
                      Open {faculty.value}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <FloatingAlerts
          error={error}
          success={success}
          onDismissError={() => setError("")}
          onDismissSuccess={() => setSuccess("")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Button color="light" onClick={() => navigate("/dashboard/staff/course")} className="rounded-xl px-4 py-2 font-semibold">
                <FaArrowLeft className="mr-2" />
                Back To All Programs
              </Button>
              <div className="mt-4 mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
                <FaBookOpen size={12} />
                Faculty Workspace
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl">{facultyLabelMap[selectedFaculty]}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
                Manage the course catalog for this faculty with a cleaner dashboard flow, modal-driven edits, and a single records table.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button color="light" onClick={() => setShowCreateModal(true)} className="rounded-xl font-semibold">
                <FaPlusCircle className="mr-2" />
                Add Course
              </Button>
              <Button color="light" onClick={() => handleLoadCourses(false)} disabled={isListLoading} className="rounded-xl font-semibold">
                {isListLoading ? <Spinner size="sm" /> : <><LuRefreshCcw className="mr-2" />Refresh</>}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="Faculty Courses" value={visibleCourses.length} subtitle="Visible in this workspace" icon={FaLayerGroup} />
            <SummaryCard title="Active Courses" value={visibleCourses.filter((course) => course.status === "ACTIVE").length} subtitle="Ready for enrollment" icon={FaSignal} />
            <SummaryCard title="Inactive Courses" value={visibleCourses.filter((course) => course.status === "INACTIVE").length} subtitle="Currently closed" icon={FaEdit} />
            <SummaryCard title="Seat Capacity" value={visibleCourses.reduce((total, course) => total + Number(course.capacity || 0), 0)} subtitle="Combined faculty intake" icon={FaChartLine} />
          </div>
        </section>

        <Card className="overflow-hidden rounded-3xl border border-slate-200/80 shadow-sm dark:border-slate-700">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-5 dark:from-slate-900 dark:to-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <LuFilter size={16} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Course Tools</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto]">
              <div>
                <Label value="Search Courses" />
                <TextInput
                  icon={LuSearch}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by ID, name, LIC, year, semester, or status"
                />
              </div>
              <div>
                <Label value="Course Details" />
                <Select value={courseIdLookup} onChange={(event) => setCourseIdLookup(event.target.value)}>
                  <option value="">Select a course</option>
                  {selectableCourses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {formatCourseOption(course)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Tooltip content="View Course Details">
                  <Button
                    color="light"
                    onClick={() => handleGetCourseById()}
                    disabled={actionLoading.getCourseById || !courseIdLookup}
                    aria-label="View Course Details"
                  >
                    {actionLoading.getCourseById ? <Spinner size="sm" /> : <LuView />}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-3xl border border-slate-200/80 shadow-lg dark:border-slate-700">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Course Records</h3>
              <p className="text-sm text-slate-500">
                Showing {filteredCourses.length} of {visibleCourses.length} courses in {selectedFaculty}
              </p>
            </div>
            <Badge color="info" className="px-3 py-1">{selectedFaculty}</Badge>
          </div>

          {isListLoading && visibleCourses.length === 0 && <CourseTableSkeleton />}
          {!isListLoading && filteredCourses.length === 0 && <CourseEmptyState />}
          {!isListLoading && filteredCourses.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <Table hoverable>
                <Table.Head className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800">
                  <Table.HeadCell>Course ID</Table.HeadCell>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Year / Sem</Table.HeadCell>
                  <Table.HeadCell>LIC</Table.HeadCell>
                  <Table.HeadCell>Capacity</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {filteredCourses.map((course) => (
                    <Table.Row key={course.courseId} className="bg-white even:bg-slate-50/60 hover:bg-cyan-50/50 dark:bg-slate-900 dark:even:bg-slate-800/70 dark:hover:bg-slate-800">
                      <Table.Cell className="font-semibold text-slate-800 dark:text-slate-100">{course.courseId || "-"}</Table.Cell>
                      <Table.Cell>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{course.name || "-"}</p>
                          <p className="text-xs text-slate-500">{facultyLabelMap[course.faculty] || course.faculty || "-"}</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color="purple">Y{course.year ?? "-"} S{course.semester ?? "-"}</Badge>
                      </Table.Cell>
                      <Table.Cell className="text-slate-600">{course.lic || "-"}</Table.Cell>
                      <Table.Cell>{course.capacity ?? "-"}</Table.Cell>
                      <Table.Cell>
                        <Badge color={getStatusTone(course.status)}>{course.status || "-"}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <Tooltip content="View Details">
                            <Button
                              size="xs"
                              color="light"
                              onClick={() => handleGetCourseById(course.courseId, true)}
                              disabled={actionLoading.getCourseById}
                            >
                              <LuView />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Update Capacity">
                            <Button size="xs" color="light" onClick={() => openCapacityModal(course)}>
                              <FaChartLine />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Update Status">
                            <Button size="xs" color="light" onClick={() => openStatusModal(course)}>
                              <FaSignal />
                            </Button>
                          </Tooltip>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Card>

        <Modal show={showCreateModal} size="5xl" onClose={() => setShowCreateModal(false)}>
          <Modal.Header>Create Course In {selectedFaculty}</Modal.Header>
          <Modal.Body>
            <form onSubmit={handleCreateCourse} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <Label value="Course ID" />
                <TextInput
                  value={courseForm.courseId}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, courseId: event.target.value }))}
                  placeholder="CS105"
                  required
                />
              </div>
              <div>
                <Label value="Course Name" />
                <TextInput
                  value={courseForm.name}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Software Engineering"
                  required
                />
              </div>
              <div>
                <Label value="Capacity" />
                <TextInput
                  type="number"
                  min={0}
                  value={courseForm.capacity}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, capacity: event.target.value }))}
                  required
                />
              </div>
              <div>
                <Label value="Faculty" />
                <TextInput value={facultyLabelMap[selectedFaculty]} disabled readOnly />
              </div>
              <div>
                <Label value="Year" />
                <Select value={courseForm.year} onChange={(event) => setCourseForm((prev) => ({ ...prev, year: event.target.value }))}>
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                </Select>
              </div>
              <div>
                <Label value="Semester" />
                <Select value={courseForm.semester} onChange={(event) => setCourseForm((prev) => ({ ...prev, semester: event.target.value }))}>
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label value="LIC" />
                <TextInput
                  value={courseForm.lic}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, lic: event.target.value }))}
                  placeholder="Dr. Silva"
                  required
                />
              </div>
              <div className="md:col-span-2 xl:col-span-4">
                <Button type="submit" color="light" disabled={actionLoading.createCourse}>
                  {actionLoading.createCourse ? <Spinner size="sm" /> : <><FaPlusCircle className="mr-2" />Create Course</>}
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>

        <Modal show={showDetailsModal} size="5xl" onClose={() => setShowDetailsModal(false)}>
          <Modal.Header>Course Details</Modal.Header>
          <Modal.Body>
            {selectedCourseResult ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Course ID</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedCourseResult.course?.courseId || "-"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Course Name</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedCourseResult.course?.name || "-"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Status</p>
                  <p className="mt-1"><Badge color={getStatusTone(selectedCourseResult.course?.status)}>{selectedCourseResult.course?.status || "-"}</Badge></p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Capacity</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedCourseResult.course?.capacity ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Year / Semester</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Y{selectedCourseResult.course?.year ?? "-"} S{selectedCourseResult.course?.semester ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">LIC</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedCourseResult.course?.lic || "-"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Faculty</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {selectedCourseResult.course?.faculty ? facultyLabelMap[selectedCourseResult.course.faculty] || selectedCourseResult.course.faculty : "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Enrolled</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedCourseResult.stats?.enrolled ?? 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Remaining Seats</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {selectedCourseResult.stats?.remaining ?? selectedCourseResult.availability?.remainingSeats ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 md:col-span-2 xl:col-span-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Availability</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {selectedCourseResult.availability?.available ? "Available for enrollment" : "Unavailable for enrollment"}
                  </p>
                </div>
              </div>
            ) : null}
          </Modal.Body>
        </Modal>

        <Modal show={showCapacityModal} size="3xl" onClose={() => setShowCapacityModal(false)}>
          <Modal.Header>Update Course Capacity</Modal.Header>
          <Modal.Body>
            <form onSubmit={handleUpdateCapacity} className="space-y-3">
              <div>
                <Label value="Course ID" />
                <TextInput value={capacityForm.courseId} readOnly />
              </div>
              <div>
                <Label value="New Capacity" />
                <TextInput
                  type="number"
                  min={0}
                  value={capacityForm.capacity}
                  onChange={(event) => setCapacityForm((prev) => ({ ...prev, capacity: event.target.value }))}
                  required
                />
              </div>
              <Button type="submit" color="light" disabled={actionLoading.updateCapacity}>
                {actionLoading.updateCapacity ? <Spinner size="sm" /> : <>Save Capacity</>}
              </Button>
            </form>
          </Modal.Body>
        </Modal>

        <Modal show={showStatusModal} size="3xl" onClose={() => setShowStatusModal(false)}>
          <Modal.Header>Update Course Status</Modal.Header>
          <Modal.Body>
            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <Label value="Course ID" />
                <TextInput value={statusForm.courseId} readOnly />
              </div>
              <div>
                <Label value="Status" />
                <Select value={statusForm.status} onChange={(event) => setStatusForm((prev) => ({ ...prev, status: event.target.value }))}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Select>
              </div>
              <Button type="submit" color="light" disabled={actionLoading.updateStatus}>
                {actionLoading.updateStatus ? <Spinner size="sm" /> : <>Save Status</>}
              </Button>
            </form>
          </Modal.Body>
        </Modal>

        <FloatingAlerts
          error={error}
          success={success}
          onDismissError={() => setError("")}
          onDismissSuccess={() => setSuccess("")}
        />
      </div>
    </div>
  );
};

export default StaffCoursePage;
