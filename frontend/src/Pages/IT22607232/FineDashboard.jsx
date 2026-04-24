import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "flowbite-react";
import { HiCash, HiClipboardList, HiLightningBolt } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FineCommandCenter from "../../components/IT22607232/FineCommandCenter";
import FineQueueBoard from "../../components/IT22607232/FineQueueBoard";
import FineSettlementPanel from "../../components/IT22607232/FineSettlementPanel";
import fineHeroPhoto from "../../assets/IT22607232/phto.jpg";
import fineService from "../../services/fine.service";
import {
  PAYMENT_METHOD_OPTIONS,
  buildFineStats,
  filterFinesByView,
  isStaffRole,
  normalizeRole,
  sortFinesByCreatedAt,
} from "../../utils/IT22607232/fineHelpers";

const emptyPaymentForm = {
  paymentMethod: PAYMENT_METHOD_OPTIONS[0],
  amount: "",
  referenceNote: "",
};

const isVisibleFineRecord = (fine) => Boolean(fine?.fineId);

const sanitizeFineCollection = (records = []) => records.filter(isVisibleFineRecord);

const pushToast = ({ type = "success", message }) => {
  if (!message) {
    return;
  }

  if (type === "failure") {
    toast.error(message);
    return;
  }

  toast.success(message);
};

const FineDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const role = normalizeRole(currentUser?.role);
  const isStaff = isStaffRole(role);

  const [fines, setFines] = useState([]);
  const [selectedFine, setSelectedFine] = useState(null);
  const [payments, setPayments] = useState([]);
  const [studentIdQuery, setStudentIdQuery] = useState("");
  const [activeStudentId, setActiveStudentId] = useState("");
  const [fineIdQuery, setFineIdQuery] = useState("");
  const [collectionScope, setCollectionScope] = useState(isStaff ? "all" : "student");
  const [selectedView, setSelectedView] = useState("all");
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [listLoading, setListLoading] = useState(false);
  const [fineLookupLoading, setFineLookupLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentWorking, setPaymentWorking] = useState(false);
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);
  const queueSectionRef = useRef(null);
  const settlementSectionRef = useRef(null);

  const selectedFineId = selectedFine?.fineId || null;
  const visibleFines = filterFinesByView(fines, selectedView);
  const visibleStats = buildFineStats(visibleFines);
  const scopeLabel =
    collectionScope === "student"
      ? activeStudentId
        ? `Student ledger for ${activeStudentId}`
        : "Student fine ledger"
      : "All recorded fines";

  const scrollToSection = (sectionRef) => {
    globalThis.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const loadPaymentsByFineId = async (fineId) => {
    if (!fineId) {
      setPayments([]);
      return;
    }

    setPaymentsLoading(true);

    try {
      const data = await fineService.getPaymentsByFineId(fineId);
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      setPayments([]);
      pushToast({ type: "failure", message: error.message || "Failed to load payment history." });
    } finally {
      setPaymentsLoading(false);
    }
  };

  const focusFine = async (fineRecord) => {
    if (!isVisibleFineRecord(fineRecord)) {
      pushToast({ type: "failure", message: "That record is hidden from the fine UI." });
      return;
    }
    setSelectedFine(fineRecord);
    await loadPaymentsByFineId(fineRecord?.fineId);
    scrollToSection(settlementSectionRef);
  };

  const syncFineIntoCollection = (fineRecord) => {
    if (!isVisibleFineRecord(fineRecord)) {
      setFines((current) => current.filter((item) => item.fineId !== fineRecord?.fineId));
      return;
    }

    setFines((current) =>
      sortFinesByCreatedAt([fineRecord, ...current.filter((item) => item.fineId !== fineRecord.fineId)])
    );
  };

  const hydrateCollection = async (records, preferredFineId = selectedFineId) => {
    const sortedRecords = sortFinesByCreatedAt(sanitizeFineCollection(Array.isArray(records) ? records : []));
    setFines(sortedRecords);

    const nextSelected = sortedRecords.find((fine) => fine.fineId === preferredFineId) || sortedRecords[0] || null;
    setSelectedFine(nextSelected);

    if (nextSelected) {
      await loadPaymentsByFineId(nextSelected.fineId);
    } else {
      setPayments([]);
    }
  };

  const loadAllFines = async (shouldScroll = true) => {
    if (!isStaff) {
      pushToast({ type: "failure", message: "Only ADMIN or INSTRUCTOR can load the full fine ledger." });
      return;
    }

    setCollectionScope("all");
    setActiveStudentId("");
    setListLoading(true);

    try {
      const data = await fineService.getAllFines();
      await hydrateCollection(data);
      pushToast({ type: "success", message: "Full fine ledger loaded." });
      if (shouldScroll) {
        scrollToSection(queueSectionRef);
      }
    } catch (error) {
      pushToast({ type: "failure", message: error.message || "Failed to load fines." });
    } finally {
      setListLoading(false);
    }
  };

  const loadStudentFines = async (shouldScroll = true) => {
    const studentId = studentIdQuery.trim();

    if (!studentId) {
      pushToast({ type: "failure", message: "Enter a student ID before loading fines." });
      return;
    }

    setCollectionScope("student");
    setActiveStudentId(studentId);
    setListLoading(true);

    try {
      const data = await fineService.getFinesByStudentId(studentId);
      await hydrateCollection(data);
      pushToast({ type: "success", message: `Loaded fines for ${studentId}.` });
      if (shouldScroll) {
        scrollToSection(queueSectionRef);
      }
    } catch (error) {
      pushToast({ type: "failure", message: error.message || "Failed to load fines for that student." });
    } finally {
      setListLoading(false);
    }
  };

  const lookupFine = async () => {
    const fineId = fineIdQuery.trim();

    if (!fineId) {
      pushToast({ type: "failure", message: "Enter a fine ID before searching." });
      return;
    }

    setFineLookupLoading(true);

    try {
      const data = await fineService.getFineById(fineId);
      if (!isVisibleFineRecord(data)) {
        pushToast({ type: "failure", message: `Fine ${fineId} is not available in the active UI.` });
        return;
      }
      syncFineIntoCollection(data);
      await focusFine(data);
      pushToast({ type: "success", message: `Fine ${fineId} loaded successfully.` });
      scrollToSection(settlementSectionRef);
    } catch (error) {
      pushToast({ type: "failure", message: error.message || "Failed to load the requested fine." });
    } finally {
      setFineLookupLoading(false);
    }
  };

  const refreshSelectedFine = async () => {
    if (!selectedFineId) {
      pushToast({ type: "failure", message: "Select a fine first so the console has something to refresh." });
      return;
    }

    setFineLookupLoading(true);

    try {
      const data = await fineService.getFineById(selectedFineId);
      if (!isVisibleFineRecord(data)) {
        setSelectedFine(null);
        setPayments([]);
        setFines((current) => current.filter((fine) => fine.fineId !== selectedFineId));
        pushToast({ type: "failure", message: `Fine ${selectedFineId} is not available in the active UI.` });
        return;
      }
      syncFineIntoCollection(data);
      setSelectedFine(data);
      await loadPaymentsByFineId(data.fineId);
      scrollToSection(settlementSectionRef);
      pushToast({ type: "success", message: `Fine ${selectedFineId} refreshed.` });
    } catch (error) {
      pushToast({ type: "failure", message: error.message || "Failed to refresh the selected fine." });
    } finally {
      setFineLookupLoading(false);
    }
  };

  const handlePaymentChange = (field, value) => {
    setPaymentForm((current) => ({ ...current, [field]: value }));
  };

  const executePayment = async () => {
    if (!selectedFine) {
      pushToast({ type: "failure", message: "Select a fine before recording a payment." });
      return;
    }

    if (selectedFine.status === "PAID") {
      pushToast({ type: "failure", message: "This fine is already marked as paid." });
      return;
    }

    setConfirmPaymentOpen(false);
    setPaymentWorking(true);

    try {
      await fineService.payFine(selectedFine.fineId, {
        paymentMethod: paymentForm.paymentMethod,
        amount: Number(selectedFine.amount),
        referenceNote: paymentForm.referenceNote.trim() || null,
      });

      const refreshedFine = await fineService.getFineById(selectedFine.fineId);
      if (!isVisibleFineRecord(refreshedFine)) {
        setSelectedFine(null);
        setPayments([]);
        setFines((current) => current.filter((fine) => fine.fineId !== selectedFine.fineId));
        pushToast({ type: "success", message: "Payment completed. The hidden test record was removed from the UI." });
        return;
      }
      syncFineIntoCollection(refreshedFine);
      setSelectedFine(refreshedFine);
      await loadPaymentsByFineId(refreshedFine.fineId);
      setPaymentForm((current) => ({ ...current, referenceNote: "", amount: String(refreshedFine.amount ?? "") }));
      pushToast({ type: "success", message: `Payment recorded successfully for ${refreshedFine.fineId}.` });
      scrollToSection(settlementSectionRef);
    } catch (error) {
      pushToast({ type: "failure", message: error.message || "Failed to record payment." });
    } finally {
      setPaymentWorking(false);
    }
  };

  const handlePaymentSubmit = (event) => {
    event.preventDefault();

    if (!selectedFine) {
      pushToast({ type: "failure", message: "Select a fine before recording a payment." });
      return;
    }

    if (selectedFine.status === "PAID") {
      pushToast({ type: "failure", message: "This fine is already marked as paid." });
      return;
    }

    setConfirmPaymentOpen(true);
  };

  useEffect(() => {
    setCollectionScope(isStaff ? "all" : "student");

    if (isStaff) {
      const loadInitialFines = async () => {
        setCollectionScope("all");
        setActiveStudentId("");
        setListLoading(true);

        try {
          const data = await fineService.getAllFines();
          const sortedRecords = sortFinesByCreatedAt(
            sanitizeFineCollection(Array.isArray(data) ? data : [])
          );
          setFines(sortedRecords);

          const nextSelected = sortedRecords[0] || null;
          setSelectedFine(nextSelected);

        if (nextSelected) {
          await loadPaymentsByFineId(nextSelected.fineId);
        } else {
          setPayments([]);
        }
      } catch (error) {
        pushToast({ type: "failure", message: error.message || "Failed to load fines." });
      } finally {
        setListLoading(false);
      }
      };

      loadInitialFines();
    } else {
      setFines([]);
      setSelectedFine(null);
      setPayments([]);
    }
  }, [isStaff]);

  useEffect(() => {
    setPaymentForm((current) => ({
      ...current,
      amount: selectedFine ? String(selectedFine.amount ?? "") : "",
    }));
  }, [selectedFine]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_30%),radial-gradient(circle_at_85%_18%,_rgba(45,212,191,0.14),_transparent_24%),linear-gradient(180deg,_#eff6ff_0%,_#f8fafc_46%,_#ecfeff_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_28%),radial-gradient(circle_at_85%_18%,_rgba(20,184,166,0.14),_transparent_20%),linear-gradient(180deg,_#020617_0%,_#0f172a_42%,_#111827_100%)]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/50 shadow-2xl shadow-slate-300/40 md:min-h-[400px]">
          <img
            src={fineHeroPhoto}
            alt="Student reading in the library for the EduNexus fine service"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.78)_0%,rgba(15,23,42,0.45)_45%,rgba(15,23,42,0.7)_100%)]" />

          <div className="relative flex min-h-[360px] items-end px-6 py-8 md:min-h-[400px] md:px-8 md:py-10 lg:px-10 lg:py-12">
            <div className="max-w-4xl space-y-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">EduNexus Library Fine Service</p>
              <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-5xl">
                Clear fine records, quick payment actions, one calm workspace.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-200 md:text-lg">
                Search the ledger, open one record, and confirm payment without jumping across multiple views.
              </p>

              <div className="grid max-w-3xl gap-4 pt-2 sm:grid-cols-3">
                <a href="#fine-command-center" className="fine-stage-link">
                  <HiClipboardList className="text-lg" />
                  Search
                </a>
                <a href="#fine-recovery-board" className="fine-stage-link">
                  <HiLightningBolt className="text-lg" />
                  Table
                </a>
                <a href="#fine-settlement-console" className="fine-stage-link">
                  <HiCash className="text-lg" />
                  Payment
                </a>
              </div>
            </div>
          </div>
        </section>

        <FineCommandCenter
          isStaff={isStaff}
          collectionScope={collectionScope}
          studentIdQuery={studentIdQuery}
          fineIdQuery={fineIdQuery}
          selectedView={selectedView}
          listLoading={listLoading}
          fineLookupLoading={fineLookupLoading}
          selectedFineId={selectedFineId}
          totalLoaded={fines.length}
          visibleCount={visibleFines.length}
          stats={visibleStats}
          scopeLabel={scopeLabel}
          selectedFine={selectedFine}
          onScopeChange={(scope) => {
            setCollectionScope(scope);

            if (scope === "all") {
              loadAllFines();
            }
          }}
          onStudentIdChange={setStudentIdQuery}
          onFineIdChange={setFineIdQuery}
          onViewChange={setSelectedView}
          onLoadAll={loadAllFines}
          onLoadStudent={loadStudentFines}
          onLookupFine={lookupFine}
          onRefreshSelected={refreshSelectedFine}
          onJumpToResults={() => scrollToSection(queueSectionRef)}
          onJumpToPayment={() => scrollToSection(settlementSectionRef)}
        />

        <div ref={queueSectionRef}>
          <FineQueueBoard
            fines={visibleFines}
            selectedView={selectedView}
            selectedFineId={selectedFineId}
            loading={listLoading}
            onSelectFine={focusFine}
            scopeLabel={scopeLabel}
            stats={visibleStats}
          />
        </div>

        <div ref={settlementSectionRef}>
          <FineSettlementPanel
            selectedFine={selectedFine}
            payments={payments}
            paymentsLoading={paymentsLoading}
            paymentForm={paymentForm}
            paymentWorking={paymentWorking}
            onPaymentChange={handlePaymentChange}
            onSubmitPayment={handlePaymentSubmit}
            onReloadPayments={() => loadPaymentsByFineId(selectedFineId)}
          />
        </div>
      </div>

      <Modal show={confirmPaymentOpen} onClose={() => !paymentWorking && setConfirmPaymentOpen(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100">
              <HiCash className="text-3xl" />
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Confirm fine payment</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                This will record the payment and update the linked borrow record.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] bg-slate-50 p-4 dark:bg-slate-900/70">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Fine ID
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{selectedFine?.fineId || "N/A"}</p>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 p-4 dark:bg-slate-900/70">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Payment method
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{paymentForm.paymentMethod}</p>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 p-4 dark:bg-slate-900/70">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Amount
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{paymentForm.amount}</p>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 p-4 dark:bg-slate-900/70">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Reference note
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                  {paymentForm.referenceNote.trim() || "No note"}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button className="fine-cta-primary" isProcessing={paymentWorking} onClick={executePayment}>
                Confirm Payment
              </Button>
              <Button color="light" onClick={() => setConfirmPaymentOpen(false)} disabled={paymentWorking}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
};

export default FineDashboard;
