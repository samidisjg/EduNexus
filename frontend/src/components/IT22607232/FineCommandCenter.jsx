import PropTypes from "prop-types";
import { Badge, Button, TextInput } from "flowbite-react";
import { HiCash, HiCheckCircle, HiClipboardList, HiEye, HiFilter, HiRefresh, HiSearch, HiUserCircle } from "react-icons/hi";
import { formatCurrency } from "../../utils/IT22607232/fineHelpers";

const viewOptions = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
];

const FineCommandCenter = ({
  isStaff,
  collectionScope,
  studentIdQuery,
  fineIdQuery,
  selectedView,
  listLoading,
  fineLookupLoading,
  selectedFineId = null,
  totalLoaded,
  visibleCount,
  stats,
  scopeLabel,
  selectedFine,
  onScopeChange,
  onStudentIdChange,
  onFineIdChange,
  onViewChange,
  onLoadAll,
  onLoadStudent,
  onLookupFine,
  onRefreshSelected,
  onJumpToResults,
  onJumpToPayment,
}) => {
  return (
    <div
      id="fine-command-center"
      className="rounded-[1.8rem] border border-cyan-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(240,249,255,0.96)_48%,rgba(236,253,245,0.94)_100%)] p-5 shadow-xl shadow-cyan-100/60 backdrop-blur dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.92)_0%,rgba(17,24,39,0.92)_58%,rgba(8,47,73,0.82)_100%)] dark:shadow-black/20 md:p-6"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Find fines</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Load the ledger, narrow the table, and open one fine at a time for payment updates.
            </p>
          </div>
          <Badge className="border-0 bg-gradient-to-r from-slate-900 to-sky-900 px-4 py-2 text-white dark:from-cyan-300 dark:to-sky-300 dark:text-slate-950">
            {scopeLabel}
          </Badge>
        </div>

        {isStaff && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                collectionScope === "all"
                  ? "border-cyan-600 bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-500/25 dark:border-cyan-300 dark:from-cyan-400 dark:to-sky-300 dark:text-slate-950"
                  : "border-cyan-200 bg-white/80 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              }`}
              onClick={() => onScopeChange("all")}
            >
              <span className="inline-flex items-center gap-2">
                <HiClipboardList className="text-lg" />
                All fines
              </span>
            </button>
            <button
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                collectionScope === "student"
                  ? "border-teal-600 bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 dark:border-emerald-300 dark:from-emerald-400 dark:to-teal-300 dark:text-slate-950"
                  : "border-cyan-200 bg-white/80 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              }`}
              onClick={() => onScopeChange("student")}
            >
              <span className="inline-flex items-center gap-2">
                <HiUserCircle className="text-lg" />
                Student fines
              </span>
            </button>
          </div>
        )}

        {!isStaff && (
          <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
            Enter a student ID or fine ID to load records.
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <form
            className="rounded-[1.5rem] border border-cyan-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.96)_0%,rgba(240,249,255,0.9)_100%)] p-5 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.75)_0%,rgba(8,47,73,0.4)_100%)]"
            onSubmit={(event) => {
              event.preventDefault();
              onLoadStudent();
            }}
          >
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Search by student ID</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Load one student&apos;s pending and paid fines into the table.
                </p>
              </div>

            <div className="mt-4">
              <TextInput
                value={studentIdQuery}
                onChange={(event) => onStudentIdChange(event.target.value)}
                placeholder="Enter student ID"
                icon={HiUserCircle}
                sizing="lg"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="submit"
                isProcessing={listLoading}
                className="border-0 bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-500 hover:to-sky-500"
              >
                <HiSearch className="mr-2 h-4 w-4" />
                Load student fines
              </Button>
              {isStaff && (
                <Button
                  color="light"
                  type="button"
                  onClick={onLoadAll}
                  isProcessing={listLoading}
                  className="border-cyan-200 bg-white/80 text-slate-700 hover:bg-cyan-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                >
                  <HiClipboardList className="mr-2 h-4 w-4" />
                  Load all fines
                </Button>
              )}
            </div>
          </form>

          <form
            className="rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.96)_0%,rgba(236,253,245,0.9)_100%)] p-5 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.75)_0%,rgba(6,78,59,0.34)_100%)]"
            onSubmit={(event) => {
              event.preventDefault();
              onLookupFine();
            }}
          >
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Search by fine ID</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Jump straight to one fine and refresh it after payment.
              </p>
            </div>

            <div className="mt-4">
              <TextInput
                value={fineIdQuery}
                onChange={(event) => onFineIdChange(event.target.value)}
                placeholder="Example: FINE-AB12CD34"
                icon={HiSearch}
                sizing="lg"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="submit"
                isProcessing={fineLookupLoading}
                className="border-0 bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:from-teal-400 hover:to-emerald-400"
              >
                <HiEye className="mr-2 h-4 w-4" />
                Fetch fine
              </Button>
              <Button
                color="light"
                type="button"
                onClick={onRefreshSelected}
                disabled={!selectedFineId}
                isProcessing={fineLookupLoading}
                className="border-teal-200 bg-white/80 text-slate-700 hover:bg-emerald-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                <HiRefresh className="mr-2 h-4 w-4" />
                Refresh selected
              </Button>
            </div>
          </form>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr_auto] xl:items-start">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-cyan-100 bg-[linear-gradient(155deg,rgba(255,255,255,0.95)_0%,rgba(239,246,255,0.95)_100%)] p-5 shadow-sm shadow-cyan-100/60 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.88)_0%,rgba(30,41,59,0.78)_100%)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Records</p>
              <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {totalLoaded} total / {visibleCount} visible
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Filter the table and open a fine to continue.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-amber-200 bg-[linear-gradient(145deg,rgba(255,251,235,0.96)_0%,rgba(255,247,237,0.94)_100%)] p-5 shadow-sm shadow-amber-100/70 dark:border-amber-500/20 dark:bg-[linear-gradient(145deg,rgba(120,53,15,0.25)_0%,rgba(15,23,42,0.9)_100%)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Pending recovery</p>
              <h3 className="mt-2 flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white">
                <HiCash className="text-amber-500" />
                {formatCurrency(stats.pendingAmount)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {stats.pendingCount} pending fine{stats.pendingCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-200 bg-[linear-gradient(145deg,rgba(236,253,245,0.96)_0%,rgba(240,253,250,0.94)_100%)] p-5 shadow-sm shadow-emerald-100/70 dark:border-emerald-500/20 dark:bg-[linear-gradient(145deg,rgba(6,78,59,0.28)_0%,rgba(15,23,42,0.9)_100%)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">Recovered amount</p>
              <h3 className="mt-2 flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white">
                <HiCheckCircle className="text-emerald-500" />
                {formatCurrency(stats.recoveredAmount)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {stats.paidCount} paid fine{stats.paidCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-cyan-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.95)_0%,rgba(240,249,255,0.92)_100%)] p-4 shadow-sm shadow-cyan-100/60 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.88)_0%,rgba(8,47,73,0.45)_100%)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              View filter
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {viewOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedView === option.key
                      ? "border-cyan-600 bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-500/25 dark:border-cyan-300 dark:from-cyan-400 dark:to-sky-300 dark:text-slate-950"
                      : "border-cyan-200 bg-white/85 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                  onClick={() => onViewChange(option.key)}
                >
                  <span className="inline-flex items-center gap-2">
                    <HiFilter className="text-lg" />
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.95)_100%)] p-4 shadow-sm shadow-slate-200/60 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.88)_0%,rgba(30,41,59,0.78)_100%)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Quick actions
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row xl:flex-col">
              <Button
                color="light"
                onClick={onJumpToResults}
                disabled={!totalLoaded}
                className="justify-center border-cyan-200 bg-white/85 text-slate-700 hover:bg-cyan-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                <HiClipboardList className="mr-2 h-4 w-4" />
                Records
              </Button>
              <Button
                color="light"
                onClick={onJumpToPayment}
                disabled={!selectedFine}
                className="justify-center border-emerald-200 bg-emerald-50/85 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100"
              >
                <HiEye className="mr-2 h-4 w-4" />
                Payment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FineCommandCenter.propTypes = {
  isStaff: PropTypes.bool.isRequired,
  collectionScope: PropTypes.string.isRequired,
  studentIdQuery: PropTypes.string.isRequired,
  fineIdQuery: PropTypes.string.isRequired,
  selectedView: PropTypes.string.isRequired,
  listLoading: PropTypes.bool.isRequired,
  fineLookupLoading: PropTypes.bool.isRequired,
  selectedFineId: PropTypes.string,
  totalLoaded: PropTypes.number.isRequired,
  visibleCount: PropTypes.number.isRequired,
  stats: PropTypes.shape({
    totalFines: PropTypes.number.isRequired,
    pendingCount: PropTypes.number.isRequired,
    paidCount: PropTypes.number.isRequired,
    pendingAmount: PropTypes.number.isRequired,
    recoveredAmount: PropTypes.number.isRequired,
  }).isRequired,
  scopeLabel: PropTypes.string.isRequired,
  selectedFine: PropTypes.shape({
    fineId: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  onScopeChange: PropTypes.func.isRequired,
  onStudentIdChange: PropTypes.func.isRequired,
  onFineIdChange: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired,
  onLoadAll: PropTypes.func.isRequired,
  onLoadStudent: PropTypes.func.isRequired,
  onLookupFine: PropTypes.func.isRequired,
  onRefreshSelected: PropTypes.func.isRequired,
  onJumpToResults: PropTypes.func.isRequired,
  onJumpToPayment: PropTypes.func.isRequired,
};

export default FineCommandCenter;
