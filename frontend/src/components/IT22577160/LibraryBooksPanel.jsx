import PropTypes from "prop-types";
import { Alert, Button, Card, Label, TextInput } from "flowbite-react";
import { HiBookOpen, HiOutlineSearch, HiPencilAlt, HiPlusCircle, HiSparkles, HiTrash } from "react-icons/hi";

const emptyBook = {
  title: "",
  author: "",
  isbn: "",
  totalCopies: "",
};

const LibraryBooksPanel = ({
  books,
  loading,
  searchTerm,
  onSearchChange,
  isStaff,
  formState,
  editingBookId,
  onFormChange,
  onSubmit,
  onReset,
  onEdit,
  onDelete,
  onBorrowPrefill,
  working,
}) => {
  const hasBookFormValues = Object.keys(emptyBook).some((key) => String(formState[key] || "") !== "");

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
      <Card className="overflow-hidden border-0 bg-white/90 shadow-xl shadow-slate-200/60 dark:bg-slate-900/80 dark:shadow-black/30">
        <div className="rounded-[1.6rem] bg-gradient-to-r from-slate-900 via-cyan-950 to-blue-950 p-5 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">Catalog workspace</p>
              <h2 className="mt-2 text-2xl font-black">Book catalog</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-200/85">
                Browse the live collection, inspect availability, and trigger a borrow flow straight from the shelf view.
              </p>
            </div>

            <div className="w-full lg:max-w-sm">
              <TextInput
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                icon={HiOutlineSearch}
                placeholder="Search by title, author, or ISBN"
                className="library-input"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Shelf results</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {books.length} item{books.length === 1 ? "" : "s"} matched your current library filter.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300">
              Loading books...
            </div>
          ) : books.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300">
              No books found for the current filter.
            </div>
          ) : (
            books.map((book) => (
              <div
                key={book.id}
                className="rounded-[1.8rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50/60 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-800 dark:to-cyan-950/30"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 text-white shadow-lg shadow-cyan-500/30">
                        <HiBookOpen className="text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{book.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">by {book.author}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-900">ISBN: {book.isbn}</span>
                      <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-900">
                        Total copies: {book.totalCopies}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                        Available: {book.availableCopies}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        <span>Inventory health</span>
                        <span>{book.totalCopies > 0 ? Math.round((book.availableCopies / book.totalCopies) * 100) : 0}% free</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600"
                          style={{
                            width: `${book.totalCopies > 0 ? (book.availableCopies / book.totalCopies) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <Button
                      color="light"
                      onClick={() => onBorrowPrefill(book)}
                      className="border border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-200"
                    >
                      Borrow This Book
                    </Button>

                    {isStaff && (
                      <>
                        <Button
                          color="light"
                          onClick={() => onEdit(book)}
                          className="border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200"
                        >
                          <HiPencilAlt className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button color="failure" onClick={() => onDelete(book)}>
                          <HiTrash className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {isStaff ? (
        <Card className="overflow-hidden border-0 bg-white/90 shadow-xl shadow-slate-200/60 dark:bg-slate-900/80 dark:shadow-black/30">
          <div className="rounded-[1.6rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3 text-white shadow-lg shadow-indigo-950/30 ring-1 ring-white/20">
                <HiPlusCircle className="text-2xl" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Curator tools</p>
                <h2 className="mt-1 text-2xl font-black">
                  {editingBookId ? "Update book" : "Add new book"}
                </h2>
                <p className="mt-1 text-sm text-white/85">
                  Manage the library catalog with the same backend rules used by the service.
                </p>
              </div>
            </div>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="md:col-span-2">
              <Label value="Title" />
              <TextInput
                name="title"
                value={formState.title}
                onChange={onFormChange}
                required
                maxLength={150}
                placeholder="Atomic Habits"
                className="library-input"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Use the public-facing title students will search for.</p>
            </div>
            <div>
              <Label value="Author" />
              <TextInput
                name="author"
                value={formState.author}
                onChange={onFormChange}
                required
                maxLength={120}
                placeholder="James Clear"
                className="library-input"
              />
            </div>
            <div>
              <Label value="ISBN" />
              <TextInput
                name="isbn"
                value={formState.isbn}
                onChange={onFormChange}
                required
                maxLength={50}
                placeholder="9780735211292"
                className="library-input"
              />
            </div>
            <div className="md:col-span-2">
              <Label value="Total copies" />
              <TextInput
                name="totalCopies"
                type="number"
                min="1"
                value={formState.totalCopies}
                onChange={onFormChange}
                required
                placeholder="8"
                className="library-input"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Available copies are calculated by the service after borrow and return actions.</p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2 md:col-span-2">
              <Button type="submit" isProcessing={working}>
                {editingBookId ? "Save Changes" : "Create Book"}
              </Button>
              <Button color="light" type="button" onClick={onReset} disabled={!editingBookId && !hasBookFormValues}>
                Clear
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-100 via-sky-50 to-white shadow-xl shadow-slate-200/60 dark:from-slate-900 dark:via-indigo-950/60 dark:to-slate-900 dark:shadow-black/30">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 p-3 text-white shadow-lg shadow-indigo-500/30">
              <HiSparkles className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Student quick guide</h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                Use the catalog to find a book, then the borrowing section to submit a borrow or return request.
                Management actions stay hidden for your role to match backend security.
              </p>
            </div>
          </div>

          <Alert color="info" className="mt-6">
            Borrowing uses the exact `bookId`, your `studentId`, and a due date. Returning only needs the `borrowId`.
          </Alert>
        </Card>
      )}
    </div>
  );
};

LibraryBooksPanel.propTypes = {
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      isbn: PropTypes.string.isRequired,
      totalCopies: PropTypes.number.isRequired,
      availableCopies: PropTypes.number.isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  isStaff: PropTypes.bool.isRequired,
  formState: PropTypes.shape({
    title: PropTypes.string,
    author: PropTypes.string,
    isbn: PropTypes.string,
    totalCopies: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  editingBookId: PropTypes.number,
  onFormChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onBorrowPrefill: PropTypes.func.isRequired,
  working: PropTypes.bool.isRequired,
};

LibraryBooksPanel.defaultProps = {
  editingBookId: null,
};

export default LibraryBooksPanel;
