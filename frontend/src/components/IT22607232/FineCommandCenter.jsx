import PropTypes from "prop-types";
import { Badge, Button, TextInput } from "flowbite-react";
import { HiClipboardList, HiEye, HiFilter, HiRefresh, HiSearch, HiUserCircle } from "react-icons/hi";

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
    <div id="fine-command-center" className="fine-command-panel">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Find fines</h2>
          </div>
          <Badge className="border-0 bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900">
            {scopeLabel}
          </Badge>
        </div>

        {isStaff && (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={`fine-compact-toggle ${collectionScope === "all" ? "fine-compact-toggle-active" : ""}`}
              onClick={() => onScopeChange("all")}
            >
              <HiClipboardList className="text-lg" />
              All fines
            </button>
            <button
              type="button"
              className={`fine-compact-toggle ${collectionScope === "student" ? "fine-compact-toggle-active" : ""}`}
              onClick={() => onScopeChange("student")}
            >
              <HiUserCircle className="text-lg" />
              Student fines
            </button>
          </div>
        )}

        {!isStaff && (
          <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
            Enter a student ID or fine ID to load records.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
            <form
              className="fine-console-block space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                onLoadStudent();
              }}
            >
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Search by student ID</h3>
              </div>

              <div className="fine-console-input">
                <TextInput
                  value={studentIdQuery}
                  onChange={(event) => onStudentIdChange(event.target.value)}
                  placeholder="Enter student ID"
                  icon={HiUserCircle}
                  sizing="lg"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" isProcessing={listLoading} className="fine-cta-primary">
                  <HiSearch className="mr-2 h-4 w-4" />
                  Load student fines
                </Button>
                {isStaff && (
                  <Button color="light" type="button" onClick={onLoadAll} isProcessing={listLoading}>
                    <HiClipboardList className="mr-2 h-4 w-4" />
                    Load all fines
                  </Button>
                )}
              </div>
            </form>

            <form
              className="fine-console-block space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                onLookupFine();
              }}
            >
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Search by fine ID</h3>
              </div>

              <div className="fine-console-input">
                <TextInput
                  value={fineIdQuery}
                  onChange={(event) => onFineIdChange(event.target.value)}
                  placeholder="Example: FINE-AB12CD34"
                  icon={HiSearch}
                  sizing="lg"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" isProcessing={fineLookupLoading} className="fine-cta-primary">
                  <HiEye className="mr-2 h-4 w-4" />
                  Fetch fine
                </Button>
                <Button
                  color="light"
                  type="button"
                  onClick={onRefreshSelected}
                  disabled={!selectedFineId}
                  isProcessing={fineLookupLoading}
                >
                  <HiRefresh className="mr-2 h-4 w-4" />
                  Refresh selected
                </Button>
              </div>
            </form>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_auto_auto]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Records</p>
            <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
              {totalLoaded} total / {visibleCount} visible
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Filter the list and open a fine to continue.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {viewOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`fine-view-toggle ${selectedView === option.key ? "fine-view-toggle-active" : ""}`}
                onClick={() => onViewChange(option.key)}
              >
                <HiFilter className="text-lg" />
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button color="light" onClick={onJumpToResults} disabled={!totalLoaded}>
              <HiClipboardList className="mr-2 h-4 w-4" />
              Records
            </Button>
            <Button color="light" onClick={onJumpToPayment} disabled={!selectedFine}>
              <HiEye className="mr-2 h-4 w-4" />
              Payment
            </Button>
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
