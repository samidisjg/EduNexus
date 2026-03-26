import PropTypes from "prop-types";
import { Badge, Button, Select, Spinner, TextInput, Textarea } from "flowbite-react";
import { HiCash, HiCheckCircle, HiClock, HiCreditCard, HiRefresh } from "react-icons/hi";
import {
  PAYMENT_METHOD_OPTIONS,
  formatCurrency,
  formatDateTime,
  getDaysLateLabel,
  getFineStatusClass,
  getPaymentMethodClass,
} from "../../utils/IT22607232/fineHelpers";

const buildSettlementRing = (status) => {
  if (status === "PAID") {
    return {
      value: 100,
      label: "Recovered",
      color: "#10b981",
      track: "rgba(16, 185, 129, 0.18)",
    };
  }

  return {
    value: 72,
    label: "Awaiting payment",
    color: "#f59e0b",
    track: "rgba(245, 158, 11, 0.16)",
  };
};

const FineSettlementPanel = ({
  selectedFine = null,
  payments,
  paymentsLoading,
  paymentForm,
  paymentWorking,
  onPaymentChange,
  onSubmitPayment,
  onReloadPayments,
}) => {
  const settlementRing = selectedFine ? buildSettlementRing(selectedFine.status) : null;
  const ringStyle = settlementRing
    ? {
        background: `conic-gradient(from 210deg, ${settlementRing.color} 0deg ${Math.round(
          (settlementRing.value / 100) * 360
        )}deg, ${settlementRing.track} ${Math.round((settlementRing.value / 100) * 360)}deg 360deg)`,
      }
    : undefined;

  return (
    <div id="fine-settlement-console" className="space-y-4">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Payment</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Open one fine, confirm the amount, then record payment and watch the history update below.
        </p>
      </div>

      {!selectedFine ? (
        <div className="fine-stage-panel min-h-[280px] text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-100">
            <HiCash className="text-3xl" />
          </div>
          <h3 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">Select a fine</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Fine details, payment fields, and payment history will appear here.
          </p>
        </div>
      ) : (
        <div className="items-start gap-6 xl:grid xl:grid-cols-[0.98fr_1.02fr]">
          <div className="space-y-6">
            <section className="rounded-[1.8rem] border border-cyan-100/70 bg-[linear-gradient(155deg,rgba(255,255,255,0.96)_0%,rgba(240,249,255,0.92)_58%,rgba(236,253,245,0.9)_100%)] p-5 shadow-lg shadow-cyan-100/60 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.92)_0%,rgba(17,24,39,0.88)_100%)] dark:shadow-black/20">
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={`border-0 px-4 py-2 text-xs font-bold ${getFineStatusClass(selectedFine.status)}`}>
                      {selectedFine.status}
                    </Badge>
                    <Badge className="border-0 bg-sky-100 px-4 py-2 text-xs font-semibold text-sky-900 dark:bg-slate-800 dark:text-slate-100">
                      Borrow #{selectedFine.borrowId}
                    </Badge>
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-cyan-300">Fine ID</p>
                  <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{selectedFine.fineId}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Student {selectedFine.studentId}. {getDaysLateLabel(selectedFine.daysLate)}. Payments recorded here
                    also update the linked borrow record.
                  </p>

                  <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-white px-5 py-4 shadow-sm shadow-amber-100/70 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Amount due</p>
                    <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(selectedFine.amount)}</p>
                  </div>
                </div>

                <aside className="rounded-[1.6rem] border border-cyan-100 bg-[linear-gradient(145deg,rgba(240,249,255,0.92)_0%,rgba(236,253,245,0.88)_100%)] p-5 shadow-sm shadow-cyan-100/60 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(8,47,73,0.45)_0%,rgba(6,78,59,0.25)_100%)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Settlement pulse</p>
                      <h4 className="mt-2 text-xl font-black text-slate-900 dark:text-white">{settlementRing.label}</h4>
                    </div>
                    <div className="relative grid h-24 w-24 place-items-center rounded-full p-[8px]" style={ringStyle}>
                      <div className="grid h-full w-full place-items-center rounded-full bg-white text-center shadow-inner shadow-slate-200/60 dark:bg-slate-900 dark:shadow-black/30">
                        <span className="text-lg font-black text-slate-900 dark:text-white">{settlementRing.value}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-[1.2rem] bg-white/90 px-4 py-3 shadow-sm shadow-cyan-100/60 dark:bg-slate-900/80">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Priority</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {selectedFine.status === "PAID" ? "Closed" : selectedFine.daysLate > 3 ? "High" : "Normal"}
                        </span>
                        <span
                          className={`h-2.5 w-20 rounded-full bg-gradient-to-r ${
                            selectedFine.status === "PAID"
                              ? "from-emerald-400 to-teal-500"
                              : selectedFine.daysLate > 3
                                ? "from-rose-400 to-orange-500"
                                : "from-amber-300 to-amber-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="rounded-[1.2rem] bg-white/90 px-4 py-3 shadow-sm shadow-emerald-100/60 dark:bg-slate-900/80">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Next action</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedFine.status === "PAID"
                          ? "Review settlement history"
                          : "Confirm amount and record payment"}
                      </p>
                    </div>

                    <div className="rounded-[1.2rem] bg-white/90 px-4 py-3 shadow-sm shadow-sky-100/60 dark:bg-slate-900/80">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Borrow sync</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        Library record #{selectedFine.borrowId} updates with this payment
                      </p>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.2rem] border border-cyan-100 bg-white/75 p-4 shadow-sm shadow-cyan-100/60 dark:border-slate-700 dark:bg-slate-950/30">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Created</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateTime(selectedFine.createdAt)}</p>
                </div>
                <div className="rounded-[1.2rem] border border-cyan-100 bg-white/75 p-4 shadow-sm shadow-cyan-100/60 dark:border-slate-700 dark:bg-slate-950/30">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Last updated</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateTime(selectedFine.updatedAt)}</p>
                </div>
                <div className="rounded-[1.2rem] border border-cyan-100 bg-white/75 p-4 shadow-sm shadow-cyan-100/60 dark:border-slate-700 dark:bg-slate-950/30">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Paid at</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateTime(selectedFine.paidAt)}</p>
                </div>
                <div className="rounded-[1.2rem] border border-cyan-100 bg-white/75 p-4 shadow-sm shadow-cyan-100/60 dark:border-slate-700 dark:bg-slate-950/30">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Progress</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {selectedFine.status === "PAID" ? (
                      <HiCheckCircle className="text-xl text-emerald-500" />
                    ) : (
                      <HiClock className="text-xl text-amber-500" />
                    )}
                    {selectedFine.status === "PAID" ? "Settlement complete" : "Awaiting payment"}
                  </p>
                </div>
              </div>
            </section>

          </div>

          <div className="space-y-6">
            <section className="rounded-[1.8rem] border border-teal-100/70 bg-[linear-gradient(155deg,rgba(255,255,255,0.96)_0%,rgba(240,253,250,0.92)_100%)] p-5 shadow-lg shadow-emerald-100/50 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.92)_0%,rgba(6,78,59,0.28)_100%)] dark:shadow-black/20">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Record payment</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Confirm the amount below and add an optional note for the settlement trail.
                  </p>
                </div>
                <Button
                  color="light"
                  onClick={onReloadPayments}
                  isProcessing={paymentsLoading}
                  className="border-teal-200 bg-white/85 text-slate-700 hover:bg-emerald-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                >
                  <HiRefresh className="mr-2 h-4 w-4" />
                  Reload
                </Button>
              </div>

              <form className="mt-5 space-y-4" onSubmit={onSubmitPayment}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="fine-input">
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Payment method
                    </label>
                    <Select
                      value={paymentForm.paymentMethod}
                      onChange={(event) => onPaymentChange("paymentMethod", event.target.value)}
                      icon={HiCreditCard}
                    >
                      {PAYMENT_METHOD_OPTIONS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="fine-input">
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Required amount
                    </label>
                    <TextInput value={paymentForm.amount} readOnly icon={HiCash} sizing="lg" />
                  </div>
                </div>

                <div className="fine-input">
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Reference note
                  </label>
                  <Textarea
                    rows={4}
                    value={paymentForm.referenceNote}
                    onChange={(event) => onPaymentChange("referenceNote", event.target.value)}
                    placeholder="Optional cashier note, transaction ref, or settlement remark"
                  />
                </div>

                <Button
                  type="submit"
                  className={`w-full border-0 ${
                    selectedFine.status === "PAID"
                      ? "bg-gradient-to-r from-sky-300 to-cyan-300 text-white dark:text-slate-950"
                      : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:from-teal-400 hover:to-emerald-400"
                  }`}
                  isProcessing={paymentWorking}
                  disabled={selectedFine.status === "PAID"}
                >
                  <HiCash className="mr-2 h-4 w-4" />
                  {selectedFine.status === "PAID" ? "Fine already paid" : "Record fine payment"}
                </Button>
              </form>
            </section>

            <section className="rounded-[1.8rem] border border-sky-100/70 bg-[linear-gradient(155deg,rgba(255,255,255,0.96)_0%,rgba(239,246,255,0.92)_100%)] p-5 shadow-lg shadow-sky-100/60 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.92)_0%,rgba(8,47,73,0.38)_100%)] dark:shadow-black/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Payment history</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Every payment recorded for this fine appears here in chronological order.
                  </p>
                </div>
                <Badge className="border-0 bg-slate-100 px-4 py-2 text-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  {payments.length} payment{payments.length === 1 ? "" : "s"}
                </Badge>
              </div>

              <div className="mt-5 space-y-5">
                {paymentsLoading ? (
                  <div className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    <Spinner size="lg" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading payment history...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm leading-6 text-slate-600 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
                    No payments found for this fine.
                  </div>
                ) : (
                  payments.map((payment, index) => (
                    <article
                      key={payment.id}
                      className="rounded-[1.4rem] border border-sky-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.94)_0%,rgba(239,246,255,0.82)_100%)] p-4 shadow-sm shadow-sky-100/50 dark:border-slate-700 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.86)_0%,rgba(8,47,73,0.26)_100%)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            Payment {index + 1}
                          </p>
                          <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Recorded {formatDateTime(payment.paidAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="border-0 bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                            #{payment.id}
                          </Badge>
                          <Badge className={`border-0 px-3 py-1 text-xs font-semibold ${getPaymentMethodClass(payment.paymentMethod)}`}>
                            {payment.paymentMethod}
                          </Badge>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {payment.referenceNote || "No reference note."}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

FineSettlementPanel.propTypes = {
  selectedFine: PropTypes.shape({
    fineId: PropTypes.string.isRequired,
    borrowId: PropTypes.number,
    studentId: PropTypes.string,
    daysLate: PropTypes.number,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    paidAt: PropTypes.string,
  }),
  payments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      paymentMethod: PropTypes.string.isRequired,
      amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      referenceNote: PropTypes.string,
      paidAt: PropTypes.string,
    })
  ).isRequired,
  paymentsLoading: PropTypes.bool.isRequired,
  paymentForm: PropTypes.shape({
    paymentMethod: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
    referenceNote: PropTypes.string.isRequired,
  }).isRequired,
  paymentWorking: PropTypes.bool.isRequired,
  onPaymentChange: PropTypes.func.isRequired,
  onSubmitPayment: PropTypes.func.isRequired,
  onReloadPayments: PropTypes.func.isRequired,
};

export default FineSettlementPanel;
