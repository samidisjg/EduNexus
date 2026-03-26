import { API_CONFIG } from "../config/api.config";
import { authenticatedFetch } from "../utils/httpClient";

const STUDENT_BASE_URL = API_CONFIG.STUDENT_SERVICE;
const COURSE_BASE_URL = API_CONFIG.COURSE_SERVICE;

const parseResponse = async (response) => {
  let payload;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload;
};

const buildQuery = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== "") {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

class StudentService {
  async getStudentList(filters = {}) {
    const query = buildQuery(filters);
    const response = await authenticatedFetch(`${STUDENT_BASE_URL}/students${query}`, {
      method: "GET",
    });
    return parseResponse(response);
  }

  async addStudent(data) {
    const response = await authenticatedFetch(`${STUDENT_BASE_URL}/students`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return parseResponse(response);
  }

  async getStudentById(studentId) {
    const response = await authenticatedFetch(`${STUDENT_BASE_URL}/students/${studentId}`, {
      method: "GET",
    });
    return parseResponse(response);
  }

  async enrollStudent(studentId, courseId) {
    const query = buildQuery({ courseId });
    const response = await authenticatedFetch(
      `${STUDENT_BASE_URL}/students/${studentId}/enroll${query}`,
      {
        method: "POST",
      }
    );
    return parseResponse(response);
  }

  async getEnrollments(studentId) {
    const response = await authenticatedFetch(
      `${STUDENT_BASE_URL}/students/${studentId}/enrollments`,
      {
        method: "GET",
      }
    );
    return parseResponse(response);
  }


  async getCourses() {
    const response = await authenticatedFetch(`${COURSE_BASE_URL}/courses`, {
      method: "GET",
    });
    return parseResponse(response);
  }

  async getCourseAvailability(courseId) {
    const candidateUrls = [
      `${COURSE_BASE_URL}/courses/${courseId}/availability`,
      `${COURSE_BASE_URL}/courses/${courseId}/available-seats`,
      `${COURSE_BASE_URL}/courses/availability?courseId=${encodeURIComponent(courseId)}`,
      `${COURSE_BASE_URL}/courses/${courseId}`,
    ];

    let lastError = null;

    for (const url of candidateUrls) {
      try {
        const response = await authenticatedFetch(url, { method: "GET" });
        const payload = await parseResponse(response);
        return payload;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Unable to fetch course availability.");
  }
}

export default new StudentService();
