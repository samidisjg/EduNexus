import PropTypes from "prop-types";
import { Badge, Button, Spinner, Table } from "flowbite-react";
import { HiCash, HiCheckCircle, HiClipboardList, HiClock, HiEye } from "react-icons/hi";
import {
  formatCurrency,
  formatDateTime,
  getDaysLateLabel,
  getFineStatusClass,
} from "../../utils/IT22607232/fineHelpers";

const viewCopy = {
  all: "Showing the full fine ledger.",
  pending: "Showing fines waiting for payment.",
  paid: "Showing settled fines with recorded payments.",
};

const FineQueueBoard = ({
  fines,
  selectedView,
  selectedFineId = null,
  loading,
  onSelectFine,
  scopeLabel,
  stats,
}) => {
  return (
    <div id="fine-recovery-board" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Fine records</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {scopeLabel}. {viewCopy[selectedView] || viewCopy.all}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Badge className="border-0 bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900">
            <HiClipboardList className="mr-2" />
            {fines.length} visible record{fines.length === 1 ? "" : "s"}
          </Badge>
          <Badge className="border-0 bg-amber-100 px-4 py-2 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
            <HiClock className="mr-2" />
            {stats.pendingCount} pending
          </Badge>
          <Badge className="border-0 bg-emerald-100 px-4 py-2 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100">
            <HiCheckCircle className="mr-2" />
            {stats.paidCount} paid
          </Badge>
        </div>
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
        <div className="overflow-hidden rounded-[1.8rem] border border-cyan-100/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(240,249,255,0.92)_100%)] shadow-xl shadow-cyan-100/60 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.92)_0%,rgba(17,24,39,0.86)_100%)] dark:shadow-black/20">
          <div className="grid gap-3 border-b border-cyan-100 bg-[linear-gradient(145deg,rgba(224,242,254,0.76)_0%,rgba(236,253,245,0.76)_100%)] px-5 py-4 md:grid-cols-3 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(8,47,73,0.45)_0%,rgba(6,78,59,0.2)_100%)]">
            <div className="rounded-[1.2rem] bg-white/90 px-4 py-3 shadow-sm shadow-cyan-100/60 dark:bg-slate-900/80">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Pending amount</p>
              <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/90 px-4 py-3 shadow-sm shadow-emerald-100/60 dark:bg-slate-900/80">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Recovered amount</p>
              <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{formatCurrency(stats.recoveredAmount)}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/90 px-4 py-3 shadow-sm shadow-sky-100/60 dark:bg-slate-900/80">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Selected fine</p>
              <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{selectedFineId || "Choose a record"}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table hoverable className="min-w-[980px] text-sm">
              <Table.Head className="bg-[linear-gradient(90deg,rgba(248,250,252,0.96)_0%,rgba(224,242,254,0.68)_45%,rgba(236,253,245,0.62)_100%)] text-slate-700 dark:bg-[linear-gradient(90deg,rgba(15,23,42,0.98)_0%,rgba(12,74,110,0.45)_52%,rgba(6,78,59,0.3)_100%)] dark:text-slate-200">
                <Table.HeadCell>Fine</Table.HeadCell>
                <Table.HeadCell>Student</Table.HeadCell>
                <Table.HeadCell>Borrow</Table.HeadCell>
                <Table.HeadCell>Delay</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Created</Table.HeadCell>
                <Table.HeadCell>Paid</Table.HeadCell>
                <Table.HeadCell>
                  <span className="sr-only">Action</span>
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {fines.map((fine) => {
                  const isSelected = selectedFineId === fine.fineId;
                  const rowClass = isSelected
                    ? "bg-[linear-gradient(90deg,rgba(236,254,255,0.98)_0%,rgba(240,253,250,0.98)_100%)] ring-1 ring-inset ring-cyan-200 dark:bg-[linear-gradient(90deg,rgba(8,47,73,0.62)_0%,rgba(6,78,59,0.38)_100%)] dark:ring-cyan-800/70"
                    : "bg-white/90 hover:bg-cyan-50/60 dark:bg-slate-900/88 dark:hover:bg-slate-800/92";

                  return (
                    <Table.Row
                      key={fine.fineId}
                      className={`cursor-pointer border-cyan-50 text-slate-700 transition dark:border-slate-700 dark:text-slate-200 ${rowClass}`}
                      onClick={() => onSelectFine(fine)}
                    >
                      <Table.Cell>
                        <div className="space-y-1">
                          <p className="font-black text-slate-900 dark:text-white">{fine.fineId}</p>
                          {isSelected ? (
                            <Badge className="w-fit border-0 bg-gradient-to-r from-cyan-500 to-sky-500 px-2 py-1 text-white dark:from-cyan-400 dark:to-sky-300 dark:text-slate-950">
                              Active
                            </Badge>
                          ) : null}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{fine.studentId || "N/A"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Fine owner</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">#{fine.borrowId ?? "N/A"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Borrow record</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>{getDaysLateLabel(fine.daysLate)}</Table.Cell>
                      <Table.Cell className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(fine.amount)}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge className={`border-0 px-3 py-1 text-xs font-semibold ${getFineStatusClass(fine.status)}`}>
                          {fine.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{formatDateTime(fine.createdAt)}</Table.Cell>
                      <Table.Cell>{formatDateTime(fine.paidAt)}</Table.Cell>
                      <Table.Cell>
                        <Button
                          size="xs"
                          className={
                            isSelected
                              ? "border-0 bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-md shadow-cyan-500/25 dark:from-cyan-500 dark:to-sky-400 dark:text-slate-950"
                              : "border-cyan-200 bg-white/90 text-slate-700 hover:bg-cyan-50 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700"
                          }
                          color={isSelected ? undefined : "light"}
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectFine(fine);
                          }}
                        >
                          <HiEye className="mr-2 h-4 w-4" />
                          {fine.status === "PAID" ? "View" : "Open"}
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
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
  stats: PropTypes.shape({
    totalFines: PropTypes.number.isRequired,
    pendingCount: PropTypes.number.isRequired,
    paidCount: PropTypes.number.isRequired,
    pendingAmount: PropTypes.number.isRequired,
    recoveredAmount: PropTypes.number.isRequired,
  }).isRequired,
};

export default FineQueueBoard;
