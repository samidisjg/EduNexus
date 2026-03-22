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
  return (
    <div id="fine-settlement-console" className="space-y-4">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Payment</h2>
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
        <div className="items-start gap-6 xl:grid xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <section className="fine-settlement-shell self-start">
              <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr]">
                <div className="flex items-center justify-center">
                  <div className="fine-amount-ring">
                    <span>{formatCurrency(selectedFine.amount)}</span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={`border-0 px-4 py-2 text-xs font-bold ${getFineStatusClass(selectedFine.status)}`}>
                      {selectedFine.status}
                    </Badge>
                    <Badge className="border-0 bg-sky-100 px-4 py-2 text-xs font-semibold text-sky-900 dark:bg-slate-800 dark:text-slate-100">
                      Borrow #{selectedFine.borrowId}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-cyan-300">Fine ID</p>
                    <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{selectedFine.fineId}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Student {selectedFine.studentId}. {getDaysLateLabel(selectedFine.daysLate)}. Payments recorded
                      here also update the linked borrow record.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-sky-100 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Created</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateTime(selectedFine.createdAt)}</p>
                    </div>
                    <div className="rounded-[1.4rem] border border-sky-100 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Last updated</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateTime(selectedFine.updatedAt)}</p>
                    </div>
                    <div className="rounded-[1.4rem] border border-sky-100 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Paid at</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateTime(selectedFine.paidAt)}</p>
                    </div>
                    <div className="rounded-[1.4rem] border border-sky-100 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Status</p>
                      <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {selectedFine.status === "PAID" ? (
                          <HiCheckCircle className="text-xl text-emerald-300" />
                        ) : (
                          <HiClock className="text-xl text-amber-300" />
                        )}
                        {selectedFine.status === "PAID" ? "Settlement complete" : "Awaiting payment"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>

          <div className="space-y-6">
            <section className="fine-stage-panel">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Record payment</h3>
                </div>
                <Button color="light" onClick={onReloadPayments} isProcessing={paymentsLoading}>
                  <HiRefresh className="mr-2 h-4 w-4" />
                  Reload
                </Button>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.3rem] border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-6 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                  Payment updates borrow record #{selectedFine.borrowId}.
                </div>

                {selectedFine.status === "PAID" ? (
                  <div className="rounded-[1.3rem] border border-sky-200 bg-sky-50/80 p-4 text-sm leading-6 text-sky-900 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-100">
                    This fine is already marked as paid.
                  </div>
                ) : null}
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
                  className="fine-cta-primary w-full"
                  isProcessing={paymentWorking}
                  disabled={selectedFine.status === "PAID"}
                >
                  <HiCash className="mr-2 h-4 w-4" />
                  {selectedFine.status === "PAID" ? "Fine already paid" : "Record fine payment"}
                </Button>
              </form>
            </section>

            <section className="fine-stage-panel">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Payment history</h3>
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
                    <div key={payment.id} className="fine-timeline-row">
                      <div className="fine-timeline-rail">
                        <span className="fine-timeline-dot">{index + 1}</span>
                      </div>
                      <article className="fine-payment-entry flex-1">
                        <span className="fine-payment-index">{payment.id}</span>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-black text-slate-900 dark:text-white">
                                {formatCurrency(payment.amount)}
                              </p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                Recorded {formatDateTime(payment.paidAt)}
                              </p>
                            </div>
                            <Badge className={`border-0 px-3 py-1 text-xs font-semibold ${getPaymentMethodClass(payment.paymentMethod)}`}>
                              {payment.paymentMethod}
                            </Badge>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {payment.referenceNote || "No reference note."}
                          </p>
                        </div>
                      </article>
                    </div>
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
