import { API_CONFIG } from "../config/api.config";
import { authenticatedFetch } from "../utils/httpClient";

const STUDENT_BASE_URL = API_CONFIG.STUDENT_SERVICE;

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

  async getStudentCountByCourse(courseId) {
    const query = buildQuery({ courseId });
    const response = await authenticatedFetch(
      `${STUDENT_BASE_URL}/internal/students/count${query}`,
      {
        method: "GET",
      }
    );
    return parseResponse(response);
  }
}

export default new StudentService();
