import { API_CONFIG } from "../config/api.config";
import { authenticatedFetch } from "../utils/httpClient";

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

class CourseService {
  async getCourses() {
    const response = await authenticatedFetch(`${COURSE_BASE_URL}/courses`, {
      method: "GET",
    });

    return parseResponse(response);
  }

  async createCourse(data) {
    const response = await authenticatedFetch(`${COURSE_BASE_URL}/courses`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return parseResponse(response);
  }

  async getCourseById(courseId) {
    const response = await authenticatedFetch(`${COURSE_BASE_URL}/courses/${courseId}`, {
      method: "GET",
    });

    return parseResponse(response);
  }

  async updateCourseCapacity(courseId, capacity) {
    const response = await authenticatedFetch(
      `${COURSE_BASE_URL}/courses/${courseId}/capacity`,
      {
        method: "PATCH",
        body: JSON.stringify({ capacity }),
      }
    );

    return parseResponse(response);
  }

  async updateCourseStatus(courseId, status) {
    const query = buildQuery({ status });
    const response = await authenticatedFetch(
      `${COURSE_BASE_URL}/courses/${courseId}/status${query}`,
      {
        method: "PATCH",
      }
    );

    return parseResponse(response);
  }

  async getCourseStats(courseId) {
    const response = await authenticatedFetch(`${COURSE_BASE_URL}/courses/${courseId}/stats`, {
      method: "GET",
    });

    return parseResponse(response);
  }

  async getCourseAvailability(courseId) {
    const response = await authenticatedFetch(
      `${COURSE_BASE_URL}/courses/${courseId}/availability`,
      {
        method: "GET",
      }
    );

    return parseResponse(response);
  }
}

export default new CourseService();
