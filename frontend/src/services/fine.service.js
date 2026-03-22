import { API_CONFIG } from "../config/api.config";
import { getFrom, postTo } from "../utils/httpClient";

const FINE_BASE_URL = API_CONFIG.FINE_SERVICE;

class FineService {
  async getAllFines() {
    return getFrom(FINE_BASE_URL, "/fines");
  }

  async getFineById(fineId) {
    return getFrom(FINE_BASE_URL, `/fines/${fineId}`);
  }

  async getFinesByStudentId(studentId) {
    return getFrom(FINE_BASE_URL, `/fines/student/${studentId}`);
  }

  async payFine(fineId, payload) {
    return postTo(FINE_BASE_URL, `/fines/${fineId}/pay`, payload);
  }

  async getPaymentsByFineId(fineId) {
    return getFrom(FINE_BASE_URL, `/fines/${fineId}/payments`);
  }
}

export default new FineService();
