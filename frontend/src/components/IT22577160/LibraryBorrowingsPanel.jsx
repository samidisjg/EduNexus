import PropTypes from "prop-types";
import { Alert, Button, Card, Label, Select, TextInput } from "flowbite-react";
import { HiOutlineCalendar, HiOutlineDownload, HiRefresh, HiSwitchHorizontal } from "react-icons/hi";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getBorrowStatusClass,
  getFineStatusClass,
} from "../../utils/IT22577160/libraryHelpers";

const LibraryBorrowingsPanel = ({
  currentUser,
  isStaff,
  borrowForm,
  returnForm,
  onBorrowChange,
  onReturnChange,
  onBorrowSubmit,
  onReturnSubmit,
  borrowWorking,
  returnWorking,
  borrowings,
  borrowingsMode,
  studentFilter,
  onBorrowingsModeChange,
  onStudentFilterChange,
  onBorrowingsFilterSubmit,
  borrowingsLoading,
}) => {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
      <div className="space-y-6">
        <Card className="overflow-hidden border-0 bg-white/90 shadow-xl shadow-slate-200/60 dark:bg-slate-900/80 dark:shadow-black/30">
          <div className="rounded-[1.6rem] bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3 text-white shadow-lg ring-1 ring-white/20">
                <HiOutlineDownload className="text-2xl" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Borrowing flow</p>
                <h2 className="mt-1 text-2xl font-black text-white">Borrow a book</h2>
                <p className="mt-1 text-sm text-white/85">
                  Submit a new borrow request to the library service.
                </p>
              </div>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onBorrowSubmit}>
            <div>
              <Label value="Book ID" />
              <TextInput
                name="bookId"
                type="number"
                min="1"
                value={borrowForm.bookId}
                onChange={onBorrowChange}
                required
                placeholder="e.g. 12"
                className="library-input"
              />
            </div>

            <div>
              <Label value="Student ID" />
              <TextInput
                name="studentId"
                value={borrowForm.studentId}
                onChange={onBorrowChange}
                placeholder={currentUser?.role === "USER" ? "Enter your student ID" : "Enter a student ID"}
                required
                className="library-input"
              />
            </div>

            <div>
              <Label value="Due date" />
              <TextInput
                name="dueDate"
                type="date"
                value={borrowForm.dueDate}
                onChange={onBorrowChange}
                required
                icon={HiOutlineCalendar}
                className="library-input"
              />
            </div>

            <Button type="submit" isProcessing={borrowWorking}>
              Borrow Book
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden border-0 bg-white/90 shadow-xl shadow-slate-200/60 dark:bg-slate-900/80 dark:shadow-black/30">
          <div className="rounded-[1.6rem] bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3 text-white shadow-lg ring-1 ring-white/20">
                <HiSwitchHorizontal className="text-2xl" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Return flow</p>
                <h2 className="mt-1 text-2xl font-black text-white">Return a book</h2>
              <p className="mt-1 text-sm text-white/85">
                Returning requires the existing `borrowId` from the library service.
              </p>
              </div>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onReturnSubmit}>
            <div>
              <Label value="Borrow ID" />
              <TextInput
                name="borrowId"
                type="number"
                min="1"
                value={returnForm.borrowId}
                onChange={onReturnChange}
                required
                placeholder="e.g. 24"
                className="library-input"
              />
            </div>

            <Button type="submit" color="warning" isProcessing={returnWorking}>
              Review Return
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A confirmation dialog will appear before the return is sent to the backend.
            </p>
          </form>
        </Card>
      </div>

      <Card className="overflow-hidden border-0 bg-white/90 shadow-xl shadow-slate-200/60 dark:bg-slate-900/80 dark:shadow-black/30">
        <div className="rounded-[1.6rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/70">Operations stream</p>
              <h2 className="mt-2 text-2xl font-black text-white">Borrowing records</h2>
              <p className="mt-2 text-sm text-slate-300">
                {isStaff
                  ? "Staff can explore all borrowings, active loans, or records for a specific student."
                  : "Detailed borrowing records are protected by the backend and shown only to staff roles."}
              </p>
            </div>
          </div>
        </div>

        {isStaff ? (
          <>
            <form className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1fr_auto]" onSubmit={onBorrowingsFilterSubmit}>
              <div>
                <Label value="Mode" />
                <Select
                  value={borrowingsMode}
                  onChange={(event) => onBorrowingsModeChange(event.target.value)}
                  className="library-input"
                >
                  <option value="all">All borrowings</option>
                  <option value="active">Active only</option>
                  <option value="student">By student ID</option>
                </Select>
              </div>

              <div>
                <Label value="Student ID" />
                <TextInput
                  value={studentFilter}
                  onChange={(event) => onStudentFilterChange(event.target.value)}
                  disabled={borrowingsMode !== "student"}
                  placeholder="IT22104567"
                  className="library-input"
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" isProcessing={borrowingsLoading}>
                  <HiRefresh className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </form>

            <div className="mt-6 space-y-4">
              {borrowingsLoading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300">
                  Loading borrowing records...
                </div>
              ) : borrowings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300">
                  No borrowing records found for the current filter.
                </div>
              ) : (
                borrowings.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-[1.8rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/60 p-5 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/20"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold shadow-sm dark:bg-slate-900">
                          Borrow ID: {record.id}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getBorrowStatusClass(record.status)}`}>
                          {record.status}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getFineStatusClass(record.fineStatus)}`}>
                          Fine: {record.fineStatus}
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl bg-white/80 p-3 shadow-sm dark:bg-slate-900/70">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Student</p>
                          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{record.studentId}</p>
                        </div>
                        <div className="rounded-2xl bg-white/80 p-3 shadow-sm dark:bg-slate-900/70">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Book</p>
                          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">ID {record.bookId}</p>
                        </div>
                        <div className="rounded-2xl bg-white/80 p-3 shadow-sm dark:bg-slate-900/70">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Due date</p>
                          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatDate(record.dueDate)}</p>
                        </div>
                        <div className="rounded-2xl bg-white/80 p-3 shadow-sm dark:bg-slate-900/70">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Fine amount</p>
                          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(record.fineAmount)}</p>
                        </div>
                      </div>

                      <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                        <p>Borrow date: {formatDate(record.borrowDate)}</p>
                        <p>Returned: {formatDate(record.returnedDate)}</p>
                        <p>Created: {formatDateTime(record.createdAt)}</p>
                        <p>Fine ID: {record.fineId || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <Alert color="warning" className="mt-6">
            Your role can still borrow and return books, but the library service restricts borrowing history and
            record analytics to staff users.
          </Alert>
        )}
      </Card>
    </div>
  );
};

LibraryBorrowingsPanel.propTypes = {
  currentUser: PropTypes.shape({
    role: PropTypes.string,
  }),
  isStaff: PropTypes.bool.isRequired,
  borrowForm: PropTypes.shape({
    bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    studentId: PropTypes.string,
    dueDate: PropTypes.string,
  }).isRequired,
  returnForm: PropTypes.shape({
    borrowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onBorrowChange: PropTypes.func.isRequired,
  onReturnChange: PropTypes.func.isRequired,
  onBorrowSubmit: PropTypes.func.isRequired,
  onReturnSubmit: PropTypes.func.isRequired,
  borrowWorking: PropTypes.bool.isRequired,
  returnWorking: PropTypes.bool.isRequired,
  borrowings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      studentId: PropTypes.string.isRequired,
      bookId: PropTypes.number.isRequired,
      status: PropTypes.string,
      fineStatus: PropTypes.string,
      dueDate: PropTypes.string,
      borrowDate: PropTypes.string,
      returnedDate: PropTypes.string,
      createdAt: PropTypes.string,
      fineId: PropTypes.string,
      fineAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  borrowingsMode: PropTypes.string.isRequired,
  studentFilter: PropTypes.string.isRequired,
  onBorrowingsModeChange: PropTypes.func.isRequired,
  onStudentFilterChange: PropTypes.func.isRequired,
  onBorrowingsFilterSubmit: PropTypes.func.isRequired,
  borrowingsLoading: PropTypes.bool.isRequired,
};

LibraryBorrowingsPanel.defaultProps = {
  currentUser: null,
};

export default LibraryBorrowingsPanel;
