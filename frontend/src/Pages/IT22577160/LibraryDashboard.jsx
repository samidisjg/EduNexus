import { useEffect, useState } from "react";
import { Badge, Button, Modal } from "flowbite-react";
import { HiLibrary, HiOutlineLightningBolt, HiOutlineSparkles, HiRefresh, HiShieldCheck } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import libraryService from "../../services/library.service";
import LibraryOverviewCards from "../../components/IT22577160/LibraryOverviewCards";
import LibraryBooksPanel from "../../components/IT22577160/LibraryBooksPanel";
import LibraryBorrowingsPanel from "../../components/IT22577160/LibraryBorrowingsPanel";
import { getRoleBadgeClass, isStaffRole, normalizeRole } from "../../utils/IT22577160/libraryHelpers";
import libraryHeroIllustration from "../../assets/IT22577160/library-hero-illustration.svg";

const emptyBookForm = {
  title: "",
  author: "",
  isbn: "",
  totalCopies: "",
};

const emptyBorrowForm = {
  bookId: "",
  studentId: "",
  dueDate: "",
};

const emptyReturnForm = {
  borrowId: "",
};

const LibraryDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const role = normalizeRole(currentUser?.role);
  const isStaff = isStaffRole(role);

  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [borrowingsLoading, setBorrowingsLoading] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [bookForm, setBookForm] = useState(emptyBookForm);
  const [borrowForm, setBorrowForm] = useState(emptyBorrowForm);
  const [returnForm, setReturnForm] = useState(emptyReturnForm);
  const [editingBookId, setEditingBookId] = useState(null);
  const [workingBook, setWorkingBook] = useState(false);
  const [workingBorrow, setWorkingBorrow] = useState(false);
  const [workingReturn, setWorkingReturn] = useState(false);
  const [confirmReturnOpen, setConfirmReturnOpen] = useState(false);
  const [pendingReturnId, setPendingReturnId] = useState(null);
  const [borrowingsMode, setBorrowingsMode] = useState("all");
  const [studentBorrowFilter, setStudentBorrowFilter] = useState("");

  const handleCloseReturnConfirmation = () => {
    setPendingReturnId(null);
    setConfirmReturnOpen(false);
  };

  const loadBooks = async () => {
    setBooksLoading(true);

    try {
      const data = await libraryService.getAllBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load books.");
    } finally {
      setBooksLoading(false);
    }
  };

  const loadBorrowings = async (mode = borrowingsMode, studentId = studentBorrowFilter) => {
    if (!isStaff) {
      setBorrowings([]);
      return;
    }

    setBorrowingsLoading(true);

    try {
      let data;

      if (mode === "active") {
        data = await libraryService.getActiveBorrowings();
      } else if (mode === "student" && studentId.trim()) {
        data = await libraryService.getBorrowingsByStudentId(studentId.trim());
      } else {
        data = await libraryService.getAllBorrowings();
      }

      setBorrowings(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load borrowing records.");
    } finally {
      setBorrowingsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (isStaff) {
      const loadInitialBorrowings = async () => {
        setBorrowingsLoading(true);

        try {
          const data = await libraryService.getAllBorrowings();
          setBorrowings(Array.isArray(data) ? data : []);
        } catch (error) {
          toast.error(error.message || "Failed to load borrowing records.");
        } finally {
          setBorrowingsLoading(false);
        }
      };

      loadInitialBorrowings();
      setBorrowingsMode("all");
      setStudentBorrowFilter("");
    } else {
      setBorrowings([]);
    }
  }, [isStaff]);

  const filteredBooks = books.filter((book) => {
    const term = bookSearch.trim().toLowerCase();

    if (!term) {
      return true;
    }

    return [book.title, book.author, book.isbn].some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(term)
    );
  });

  const stats = {
    totalBooks: books.length,
    availableCopies: books.reduce((sum, book) => sum + Number(book.availableCopies || 0), 0),
    activeBorrowings: borrowings.filter((record) => record.status === "BORROWED").length,
    totalBorrowings: borrowings.length,
  };

  const handleBookFormChange = (event) => {
    const { name, value } = event.target;
    setBookForm((current) => ({ ...current, [name]: value }));
  };

  const handleBorrowFormChange = (event) => {
    const { name, value } = event.target;
    setBorrowForm((current) => ({ ...current, [name]: value }));
  };

  const handleReturnFormChange = (event) => {
    const { name, value } = event.target;
    setReturnForm((current) => ({ ...current, [name]: value }));
  };

  const resetBookForm = () => {
    setBookForm(emptyBookForm);
    setEditingBookId(null);
  };

  const handleBookSubmit = async (event) => {
    event.preventDefault();
    setWorkingBook(true);

    try {
      const payload = {
        ...bookForm,
        totalCopies: Number(bookForm.totalCopies),
      };

      if (editingBookId) {
        await libraryService.updateBook(editingBookId, payload);
        toast.success("Book updated successfully.");
      } else {
        await libraryService.createBook(payload);
        toast.success("Book created successfully.");
      }

      resetBookForm();
      await loadBooks();
    } catch (error) {
      toast.error(error.message || "Book request failed.");
    } finally {
      setWorkingBook(false);
    }
  };

  const handleEditBook = (book) => {
    setEditingBookId(book.id);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      totalCopies: String(book.totalCopies),
    });
    toast.dismiss();
  };

  const handleDeleteBook = async (book) => {
    const confirmed = window.confirm(`Delete "${book.title}" from the catalog?`);
    if (!confirmed) {
      return;
    }

    setWorkingBook(true);

    try {
      await libraryService.deleteBook(book.id);
      toast.success("Book deleted successfully.");
      if (editingBookId === book.id) {
        resetBookForm();
      }
      await loadBooks();
    } catch (error) {
      toast.error(error.message || "Failed to delete the book.");
    } finally {
      setWorkingBook(false);
    }
  };

  const handleBorrowSubmit = async (event) => {
    event.preventDefault();
    setWorkingBorrow(true);

    try {
      await libraryService.borrowBook({
        bookId: Number(borrowForm.bookId),
        studentId: borrowForm.studentId.trim(),
        dueDate: borrowForm.dueDate,
      });

      setBorrowForm((current) => ({ ...emptyBorrowForm, studentId: current.studentId }));
      toast.success("Borrow request submitted successfully.");
      await loadBooks();
      if (isStaff) {
        await loadBorrowings();
      }
    } catch (error) {
      toast.error(error.message || "Borrow request failed.");
    } finally {
      setWorkingBorrow(false);
    }
  };

  const executeReturn = async (borrowId) => {
    setWorkingReturn(true);

    try {
      await libraryService.returnBook(Number(borrowId));

      const returnedAt = new Date().toISOString().slice(0, 10);
      setBorrowings((current) => {
        const updated = current.map((record) =>
          record.id === Number(borrowId)
            ? {
                ...record,
                status: "RETURNED",
                returnedDate: returnedAt,
              }
            : record
        );

        if (borrowingsMode === "active") {
          return updated.filter((record) => record.id !== Number(borrowId));
        }

        return updated;
      });

      setReturnForm(emptyReturnForm);
      toast.success("Book returned successfully.");
      await loadBooks();
      if (isStaff) {
        await loadBorrowings();
      }
    } catch (error) {
      toast.error(error.message || "Return request failed.");
    } finally {
      setWorkingReturn(false);
      setPendingReturnId(null);
      setConfirmReturnOpen(false);
    }
  };

  const handleReturnSubmit = async (event) => {
    event.preventDefault();
    const borrowId = Number(returnForm.borrowId);

    if (!borrowId) {
      toast.error("Enter a valid borrow ID before returning.");
      return;
    }

    setPendingReturnId(borrowId);
    setConfirmReturnOpen(true);
  };

  const handleBorrowingsFilterSubmit = async (event) => {
    event.preventDefault();
    await loadBorrowings();
  };

  const handleBorrowPrefill = (book) => {
    setBorrowForm((current) => ({
      ...current,
      bookId: String(book.id),
    }));
    toast.info(`Book ID ${book.id} is ready in the borrow form.`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_32%),radial-gradient(circle_at_85%_18%,_rgba(99,102,241,0.16),_transparent_22%),linear-gradient(180deg,_#eef6ff_0%,_#f8fbff_45%,_#eef2ff_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_28%),radial-gradient(circle_at_85%_18%,_rgba(99,102,241,0.18),_transparent_20%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-400/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_22%),radial-gradient(circle_at_80%_20%,_rgba(99,102,241,0.25),_transparent_25%)]" />
          <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-indigo-500/15 blur-3xl" />

          <div className="relative grid gap-8 px-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-100">
                <HiLibrary className="text-lg" />
                IT22577160 Library Portal
              </div>

              <div>
                <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-5xl">
                  EduNexus library operations dashboard Service
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
                  A polished working space for collection control, circulation flows, and staff-ready insights,
                  aligned directly with your gateway-protected library service.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge className={`border-0 px-4 py-2 text-sm font-semibold ${getRoleBadgeClass(role)}`}>
                  {role || "USER"}
                </Badge>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100">
                  <HiShieldCheck className="text-lg" />
                  Gateway-authenticated library access
                </div>
              </div>

              <div className="grid gap-4 pt-2 sm:grid-cols-3">
                <a href="#library-catalog" className="library-hero-link">
                  <HiLibrary className="text-lg" />
                  Catalog
                </a>
                <a href="#library-circulation" className="library-hero-link">
                  <HiOutlineLightningBolt className="text-lg" />
                  Circulation
                </a>
                <a href="#library-records" className="library-hero-link">
                  <HiOutlineSparkles className="text-lg" />
                  Records
                </a>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Signed in as</p>
                  <h2 className="mt-2 text-2xl font-black">{currentUser?.userName || "Library user"}</h2>
                  <p className="mt-1 text-sm text-slate-300">{currentUser?.userEmail}</p>
                </div>

                <Button
                  color="light"
                  onClick={() => {
                    toast.dismiss();
                    loadBooks();
                    if (isStaff) {
                      loadBorrowings();
                    }
                  }}
                >
                  <HiRefresh className="mr-2 h-4 w-4" />
                  Refresh data
                </Button>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/40 shadow-2xl shadow-slate-950/20">
                <img
                  src={libraryHeroIllustration}
                  alt="Illustration of the EduNexus library with shelves, study desks, and circulation activity"
                  className="h-52 w-full object-cover object-center"
                />
                {/* <div className="grid gap-4 border-t border-white/10 bg-slate-950/55 p-4 sm:grid-cols-[1.35fr_1fr]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Library experience</p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      A calm, modern circulation hub for catalog browsing, borrowing workflows, and real-time records
                      through the EduNexus gateway.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Service route</p>
                    <p className="mt-2 break-all text-sm text-slate-200">
                      /api-gateway/library-service/library/*
                    </p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">At a glance</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Live library snapshot</h2>
          </div>
          <LibraryOverviewCards stats={stats} isStaff={isStaff} />
        </section>

        <section id="library-catalog">
          <LibraryBooksPanel
            books={filteredBooks}
            loading={booksLoading}
            searchTerm={bookSearch}
            onSearchChange={setBookSearch}
            isStaff={isStaff}
            formState={bookForm}
            editingBookId={editingBookId}
            onFormChange={handleBookFormChange}
            onSubmit={handleBookSubmit}
            onReset={resetBookForm}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
            onBorrowPrefill={handleBorrowPrefill}
            working={workingBook}
          />
        </section>

        <section id="library-circulation">
          <LibraryBorrowingsPanel
            currentUser={currentUser}
            isStaff={isStaff}
            borrowForm={borrowForm}
            returnForm={returnForm}
            onBorrowChange={handleBorrowFormChange}
            onReturnChange={handleReturnFormChange}
            onBorrowSubmit={handleBorrowSubmit}
            onReturnSubmit={handleReturnSubmit}
            borrowWorking={workingBorrow}
            returnWorking={workingReturn}
            borrowings={borrowings}
            borrowingsMode={borrowingsMode}
            studentFilter={studentBorrowFilter}
            onBorrowingsModeChange={setBorrowingsMode}
            onStudentFilterChange={setStudentBorrowFilter}
            onBorrowingsFilterSubmit={handleBorrowingsFilterSubmit}
            borrowingsLoading={borrowingsLoading}
          />
        </section>
      </div>

      <ToastContainer
        position="bottom-center"
        autoClose={3500}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={theme === "dark" ? "dark" : "light"}
      />

      <Modal show={confirmReturnOpen} onClose={() => !workingReturn && handleCloseReturnConfirmation()} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
              <HiRefresh className="text-3xl" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Confirm return</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Return borrow record <span className="font-bold">#{pendingReturnId}</span>? Once completed, the
                borrowing list and library stock will refresh immediately.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button color="warning" isProcessing={workingReturn} onClick={() => executeReturn(pendingReturnId)}>
                Confirm Return
              </Button>
              <Button color="light" onClick={handleCloseReturnConfirmation} disabled={workingReturn}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LibraryDashboard;
