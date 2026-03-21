import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Label,
  Spinner,
  Table,
  TextInput,
  Select,
} from "flowbite-react";
import {
  FaArrowLeft,
  FaBookOpen,
  FaChartLine,
  FaClipboardList,
  FaEdit,
  FaLayerGroup,
  FaPlusCircle,
  FaSearch,
  FaSignal,
  FaUniversity,
} from "react-icons/fa";
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

const isCourseLike = (item) =>
  Boolean(item) &&
  typeof item === "object" &&
  ("courseId" in item ||
    "name" in item ||
    "capacity" in item ||
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

const StaffCoursePage = () => {
  const navigate = useNavigate();
  const { facultyCode } = useParams();
  const selectedFaculty = facultyOptions.find((faculty) => faculty.value === facultyCode)?.value || null;

  const [courses, setCourses] = useState([]);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [courseForm, setCourseForm] = useState(buildInitialCourseForm(selectedFaculty || "FOC"));
  const [courseIdLookup, setCourseIdLookup] = useState("");
  const [capacityForm, setCapacityForm] = useState(initialCapacityForm);
  const [statusForm, setStatusForm] = useState(initialStatusForm);
  const [statsCourseId, setStatsCourseId] = useState("");
  const [availabilityCourseId, setAvailabilityCourseId] = useState("");
  const [statsResult, setStatsResult] = useState(null);
  const [availabilityResult, setAvailabilityResult] = useState(null);

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

  const handleLoadCourses = async () => {
    const response = await runAction(
      "listCourses",
      () => courseService.getCourses(),
      "Course list loaded."
    );

    if (response) {
      setCourses(extractArray(response));
    }
  };

  useEffect(() => {
    handleLoadCourses();
  }, []);

  useEffect(() => {
    setCourseForm(buildInitialCourseForm(selectedFaculty || "FOC"));
  }, [selectedFaculty]);

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    const response = await runAction(
      "createCourse",
      () =>
        courseService.createCourse({
          ...courseForm,
          faculty: selectedFaculty || courseForm.faculty,
          capacity: Number(courseForm.capacity),
        }),
      "Course created successfully."
    );

    if (response) {
      upsertCourse(response);
      setCourseForm(buildInitialCourseForm(selectedFaculty || "FOC"));
    }
  };

  const handleGetCourseById = async () => {
    if (!courseIdLookup.trim()) {
      setError("Course ID is required.");
      return;
    }

    const response = await runAction(
      "getCourseById",
      () => courseService.getCourseById(courseIdLookup.trim()),
      "Course fetched successfully."
    );

    if (response) {
      upsertCourse(response);
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
    }
  };

  const handleGetStats = async () => {
    if (!statsCourseId.trim()) {
      setError("Course ID is required to load stats.");
      return;
    }

    const response = await runAction(
      "getStats",
      () => courseService.getCourseStats(statsCourseId.trim()),
      "Course stats loaded."
    );

    if (response) {
      setStatsResult(response);
    }
  };

  const handleGetAvailability = async () => {
    if (!availabilityCourseId.trim()) {
      setError("Course ID is required to check availability.");
      return;
    }

    const response = await runAction(
      "getAvailability",
      () => courseService.getCourseAvailability(availabilityCourseId.trim()),
      "Course availability loaded."
    );

    if (response) {
      setAvailabilityResult(response);
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

    return [course.courseId, course.name, course.faculty, course.status]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword));
  });

  const statsSelectableCourses = [...visibleCourses].sort((left, right) =>
    (left.courseId || "").localeCompare(right.courseId || "")
  );

  const totalCourses = courses.length;
  const totalCapacity = courses.reduce(
    (total, course) => total + Number(course.capacity || 0),
    0
  );
  const activeCourses = courses.filter((course) => course.status === "ACTIVE").length;
  const inactiveCourses = courses.filter((course) => course.status === "INACTIVE").length;

  if (!selectedFaculty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-cyan-50 px-4 py-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">
                  Staff Course Desk
                </p>
                <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                  All Programs
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
                  Start from a faculty overview, compare course load and seating capacity, then
                  open the faculty workspace for direct course management.
                </p>
              </div>
              <Badge color="info" className="px-3 py-1">
                5 FACULTIES
              </Badge>
            </div>

            {error ? <Alert color="failure" className="mt-4">{error}</Alert> : null}
            {success ? <Alert color="success" className="mt-4">{success}</Alert> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                  <FaUniversity />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Faculties</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {facultyOptions.length}
                  </h2>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <FaLayerGroup />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Courses</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{totalCourses}</h2>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                  <FaChartLine />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Capacity</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{totalCapacity}</h2>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <FaSignal />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Active Courses</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{activeCourses}</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{inactiveCourses} inactive</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {coursesByFaculty.map((faculty) => (
              <Card key={faculty.value} className="border border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                      {faculty.value}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                      {faculty.label.replace(`${faculty.value} - `, "")}
                    </h2>
                  </div>
                  <Badge color="info">{faculty.courseCount} Courses</Badge>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Seating Capacity</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {faculty.totalSeats}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Active Courses</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {faculty.activeCount}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Open the faculty course desk to manage courses directly.
                  </p>
                  <Button onClick={() => navigate(`/dashboard/staff/course/${faculty.value}`)}>
                    Open {faculty.value}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              All Programs Capacity Table
            </h2>
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Faculty</Table.HeadCell>
                  <Table.HeadCell>Courses</Table.HeadCell>
                  <Table.HeadCell>Active Courses</Table.HeadCell>
                  <Table.HeadCell>Total Capacity</Table.HeadCell>
                  <Table.HeadCell>Open</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {coursesByFaculty.map((faculty) => (
                    <Table.Row key={faculty.value}>
                      <Table.Cell>{faculty.label}</Table.Cell>
                      <Table.Cell>{faculty.courseCount}</Table.Cell>
                      <Table.Cell>{faculty.activeCount}</Table.Cell>
                      <Table.Cell>{faculty.totalSeats}</Table.Cell>
                      <Table.Cell>
                        <Button size="xs" onClick={() => navigate(`/dashboard/staff/course/${faculty.value}`)}>
                          View Faculty
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-cyan-50 px-4 py-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Button color="light" onClick={() => navigate("/dashboard/staff/course")}>
                <FaArrowLeft className="mr-2" />
                Back To All Programs
              </Button>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">
                {selectedFaculty}
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                {facultyLabelMap[selectedFaculty]}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Manage courses within this faculty workspace. Course creation is pinned to the
                selected faculty.
              </p>
            </div>
            <Badge color="info" className="px-3 py-1">
              FACULTY WORKSPACE
            </Badge>
          </div>

          {error ? <Alert color="failure" className="mt-4">{error}</Alert> : null}
          {success ? <Alert color="success" className="mt-4">{success}</Alert> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                <FaLayerGroup />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Faculty Courses</p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{visibleCourses.length}</h2>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <FaSignal />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Courses</p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {visibleCourses.filter((course) => course.status === "ACTIVE").length}
                </h2>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <FaClipboardList />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Inactive Courses</p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {visibleCourses.filter((course) => course.status === "INACTIVE").length}
                </h2>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                <FaChartLine />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Faculty Capacity</p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {visibleCourses.reduce((total, course) => total + Number(course.capacity || 0), 0)}
                </h2>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <FaSearch /> Load {selectedFaculty} Courses
            </h2>
            <div className="space-y-3">
              <div>
                <Label value="Client-side Search" />
                <TextInput
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Filter by course ID, name, faculty, or status"
                />
              </div>
              <Button onClick={handleLoadCourses} disabled={actionLoading.listCourses}>
                {actionLoading.listCourses ? <Spinner size="sm" /> : "Refresh Faculty Data"}
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <FaBookOpen /> Get Course By ID
            </h2>
            <div className="space-y-3">
              <div>
                <Label value="Course ID" />
                <TextInput
                  value={courseIdLookup}
                  onChange={(event) => setCourseIdLookup(event.target.value)}
                  placeholder="CS105"
                />
              </div>
              <Button onClick={handleGetCourseById} disabled={actionLoading.getCourseById}>
                {actionLoading.getCourseById ? <Spinner size="sm" /> : "Fetch Course"}
              </Button>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <FaPlusCircle /> Create Course In {selectedFaculty}
            </h2>
            <form onSubmit={handleCreateCourse} className="grid gap-3 md:grid-cols-4">
              <div>
                <Label value="Course ID" />
                <TextInput
                  value={courseForm.courseId}
                  onChange={(event) =>
                    setCourseForm((prev) => ({ ...prev, courseId: event.target.value }))
                  }
                  placeholder="CS105"
                  required
                />
              </div>
              <div>
                <Label value="Course Name" />
                <TextInput
                  value={courseForm.name}
                  onChange={(event) =>
                    setCourseForm((prev) => ({ ...prev, name: event.target.value }))
                  }
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
                  onChange={(event) =>
                    setCourseForm((prev) => ({ ...prev, capacity: event.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label value="Faculty" />
                <TextInput value={facultyLabelMap[selectedFaculty]} disabled readOnly />
              </div>
              <div className="md:col-span-4">
                <Button type="submit" disabled={actionLoading.createCourse}>
                  {actionLoading.createCourse ? <Spinner size="sm" /> : "Create Course"}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <FaEdit /> Update Capacity
            </h2>
            <form onSubmit={handleUpdateCapacity} className="space-y-3">
              <div>
                <Label value="Course ID" />
                <TextInput
                  value={capacityForm.courseId}
                  onChange={(event) =>
                    setCapacityForm((prev) => ({ ...prev, courseId: event.target.value }))
                  }
                  placeholder="CS105"
                  required
                />
              </div>
              <div>
                <Label value="New Capacity" />
                <TextInput
                  type="number"
                  min={0}
                  value={capacityForm.capacity}
                  onChange={(event) =>
                    setCapacityForm((prev) => ({ ...prev, capacity: event.target.value }))
                  }
                  required
                />
              </div>
              <Button type="submit" disabled={actionLoading.updateCapacity}>
                {actionLoading.updateCapacity ? <Spinner size="sm" /> : "Save Capacity"}
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <FaSignal /> Update Status
            </h2>
            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <Label value="Course ID" />
                <TextInput
                  value={statusForm.courseId}
                  onChange={(event) =>
                    setStatusForm((prev) => ({ ...prev, courseId: event.target.value }))
                  }
                  placeholder="CS105"
                  required
                />
              </div>
              <div>
                <Label value="Status" />
                <Select
                  value={statusForm.status}
                  onChange={(event) =>
                    setStatusForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Select>
              </div>
              <Button type="submit" disabled={actionLoading.updateStatus}>
                {actionLoading.updateStatus ? <Spinner size="sm" /> : "Save Status"}
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              Course Stats
            </h2>
            <div className="space-y-3">
              <div>
                <Label value="Course ID" />
                <Select
                  value={statsCourseId}
                  onChange={(event) => setStatsCourseId(event.target.value)}
                >
                  <option value="">Select a course</option>
                  {statsSelectableCourses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.courseId} - {course.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button onClick={handleGetStats} disabled={actionLoading.getStats}>
                {actionLoading.getStats ? <Spinner size="sm" /> : "Get Stats"}
              </Button>
              {statsResult ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enrolled</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {statsResult.enrolled ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Remaining Seats</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {statsResult.remaining ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Capacity</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {statsResult.capacity ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {statsResult.status || "-"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              Course Availability
            </h2>
            <div className="space-y-3">
              <div>
                <Label value="Course ID" />
                <Select
                  value={availabilityCourseId}
                  onChange={(event) => setAvailabilityCourseId(event.target.value)}
                >
                  <option value="">Select a course</option>
                  {statsSelectableCourses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.courseId} - {course.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button onClick={handleGetAvailability} disabled={actionLoading.getAvailability}>
                {actionLoading.getAvailability ? <Spinner size="sm" /> : "Check Availability"}
              </Button>
              {availabilityResult ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Available</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {availabilityResult.available ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Remaining Seats</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {availabilityResult.remainingSeats ?? 0}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {selectedFaculty} Courses Table
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filteredCourses.length} visible course{filteredCourses.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Course ID</Table.HeadCell>
                <Table.HeadCell>Name</Table.HeadCell>
                <Table.HeadCell>Capacity</Table.HeadCell>
                <Table.HeadCell>Faculty</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course, index) => (
                    <Table.Row key={course.courseId || index}>
                      <Table.Cell>{course.courseId || "-"}</Table.Cell>
                      <Table.Cell>{course.name || "-"}</Table.Cell>
                      <Table.Cell>{course.capacity ?? "-"}</Table.Cell>
                      <Table.Cell>
                        {course.faculty ? facultyLabelMap[course.faculty] || course.faculty : "-"}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={course.status === "ACTIVE" ? "success" : "warning"}>
                          {course.status || "-"}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="text-center text-slate-500">
                      No course data loaded for this faculty yet.
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

export default StaffCoursePage;
