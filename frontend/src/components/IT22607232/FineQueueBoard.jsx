import PropTypes from "prop-types";
import { Badge, Spinner } from "flowbite-react";
import { HiCash, HiCheckCircle, HiClock, HiClipboardList, HiUserCircle } from "react-icons/hi";
import {
  formatCurrency,
  formatDateTime,
  getDaysLateLabel,
  getFineStatusClass,
  groupFinesByStatus,
} from "../../utils/IT22607232/fineHelpers";

const laneMeta = {
  pending: {
    title: "Pending fines",
    icon: HiClock,
    helper: "Fines waiting for payment",
  },
  paid: {
    title: "Paid fines",
    icon: HiCheckCircle,
    helper: "Settled fines with recorded payments",
  },
};

const FineQueueBoard = ({ fines, selectedView, selectedFineId = null, loading, onSelectFine, scopeLabel }) => {
  const groups = groupFinesByStatus(fines);
  const laneKeys = selectedView === "all" ? ["pending", "paid"] : [selectedView];

  return (
    <div id="fine-recovery-board" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Fine records</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {scopeLabel}. Select a fine to view details and payment history.
          </p>
        </div>

        <Badge className="border-0 bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900">
          <HiClipboardList className="mr-2" />
          {fines.length} visible record{fines.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {loading ? (
        <div className="fine-stage-panel flex min-h-[260px] items-center justify-center">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">Loading fine records...</p>
          </div>
        </div>
      ) : fines.length === 0 ? (
        <div className="fine-stage-panel min-h-[260px] text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-100">
            <HiCash className="text-3xl" />
          </div>
          <h3 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">No fines loaded yet</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Load all fines, search by student ID, or fetch one fine ID to show records here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {laneKeys.map((laneKey) => {
            const laneItems = groups[laneKey];
            const lane = laneMeta[laneKey];
            const Icon = lane.icon;

            return (
              <section key={laneKey} className="fine-lane">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      {lane.title}
                    </p>
                    <h3 className="mt-2 flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
                      <Icon className="text-amber-500" />
                      {laneItems.length} record{laneItems.length === 1 ? "" : "s"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{lane.helper}</p>
                  </div>
                  <Badge className="border-0 bg-white px-4 py-2 text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-100">
                    {laneKey.toUpperCase()}
                  </Badge>
                </div>

                <div className="mt-5 space-y-4">
                  {laneItems.length === 0 ? (
                    <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
                      No fines in this section for the current filter.
                    </div>
                  ) : (
                    laneItems.map((fine) => (
                      <article
                        key={fine.fineId}
                        className={`fine-ticket ${
                          fine.status === "PAID" ? "fine-ticket-paid" : "fine-ticket-pending"
                        } ${selectedFineId === fine.fineId ? "fine-ticket-selected" : ""}`}
                        onClick={() => onSelectFine(fine)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelectFine(fine);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              Fine ID
                            </p>
                            <h4 className="mt-2 text-xl font-black text-slate-900 dark:text-white">{fine.fineId}</h4>
                          </div>
                          <Badge className={`border-0 px-3 py-1 text-xs font-semibold ${getFineStatusClass(fine.status)}`}>
                            {fine.status}
                          </Badge>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/60">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              Student
                            </p>
                            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                              <HiUserCircle className="text-lg text-teal-500" />
                              {fine.studentId}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/60">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              Amount
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {formatCurrency(fine.amount)}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/60">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              Borrow record
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">#{fine.borrowId}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/60">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              Delay
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {getDaysLateLabel(fine.daysLate)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Created {formatDateTime(fine.createdAt)}
                          </p>
                          {fine.paidAt ? (
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-300">
                              Paid {formatDateTime(fine.paidAt)}
                            </p>
                          ) : (
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-300">Awaiting settlement</p>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

FineQueueBoard.propTypes = {
  fines: PropTypes.arrayOf(
    PropTypes.shape({
      fineId: PropTypes.string.isRequired,
      borrowId: PropTypes.number,
      studentId: PropTypes.string,
      daysLate: PropTypes.number,
      amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      status: PropTypes.string,
      createdAt: PropTypes.string,
      paidAt: PropTypes.string,
    })
  ).isRequired,
  selectedView: PropTypes.string.isRequired,
  selectedFineId: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  onSelectFine: PropTypes.func.isRequired,
  scopeLabel: PropTypes.string.isRequired,
};

export default FineQueueBoard;
