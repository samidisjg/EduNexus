import { API_CONFIG } from '../config/api.config';
import {
  deleteFrom,
  getFrom,
  postTo,
  putTo,
} from '../utils/httpClient';

const LIBRARY_BASE_URL = API_CONFIG.LIBRARY_SERVICE;

class LibraryService {
  async getAllBooks() {
    return getFrom(LIBRARY_BASE_URL, '/library/books');
  }

  async getBookById(bookId) {
    return getFrom(LIBRARY_BASE_URL, `/library/books/${bookId}`);
  }

  async createBook(payload) {
    return postTo(LIBRARY_BASE_URL, '/library/books', payload);
  }

  async updateBook(bookId, payload) {
    return putTo(LIBRARY_BASE_URL, `/library/books/${bookId}`, payload);
  }

  async deleteBook(bookId) {
    return deleteFrom(LIBRARY_BASE_URL, `/library/books/${bookId}`);
  }

  async borrowBook(payload) {
    return postTo(LIBRARY_BASE_URL, '/library/borrow', payload);
  }

  async returnBook(borrowId) {
    return postTo(LIBRARY_BASE_URL, `/library/return/${borrowId}`, {});
  }

  async getAllBorrowings() {
    return getFrom(LIBRARY_BASE_URL, '/library/borrowings');
  }

  async getBorrowingById(borrowId) {
    return getFrom(LIBRARY_BASE_URL, `/library/borrowings/${borrowId}`);
  }

  async getBorrowingsByStudentId(studentId) {
    return getFrom(LIBRARY_BASE_URL, `/library/borrowings/student/${studentId}`);
  }

  async getActiveBorrowings() {
    return getFrom(LIBRARY_BASE_URL, '/library/borrowings/active');
  }
}

export default new LibraryService();
