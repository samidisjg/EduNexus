export const PAYMENT_METHOD_OPTIONS = ["ONLINE", "CARD", "CASH"];

export const normalizeRole = (role) => (role || "").trim().toUpperCase();

export const isStaffRole = (role) => ["ADMIN", "INSTRUCTOR"].includes(normalizeRole(role));

export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "LKR 0.00";
  }

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(Number(value));
};

export const formatDateTime = (value) => {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const getFineStatusClass = (status) => {
  if (status === "PAID") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200";
  }

  return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200";
};

export const getPaymentMethodClass = (method) => {
  if (method === "CARD") {
    return "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200";
  }

  if (method === "CASH") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200";
  }

  return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200";
};

export const getDaysLateLabel = (daysLate) => {
  if (!daysLate) {
    return "Returned on time";
  }

  return `${daysLate} day${daysLate === 1 ? "" : "s"} late`;
};

export const buildFineStats = (fines = []) => {
  const pending = fines.filter((fine) => fine.status === "PENDING");
  const paid = fines.filter((fine) => fine.status === "PAID");

  return {
    totalFines: fines.length,
    pendingCount: pending.length,
    paidCount: paid.length,
    pendingAmount: pending.reduce((sum, fine) => sum + Number(fine.amount || 0), 0),
    recoveredAmount: paid.reduce((sum, fine) => sum + Number(fine.amount || 0), 0),
  };
};

export const sortFinesByCreatedAt = (fines = []) =>
  [...fines].sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));

export const filterFinesByView = (fines = [], view = "all") => {
  if (view === "all") {
    return fines;
  }

  return fines.filter((fine) => fine.status === view.toUpperCase());
};

export const groupFinesByStatus = (fines = []) => ({
  pending: fines.filter((fine) => fine.status === "PENDING"),
  paid: fines.filter((fine) => fine.status === "PAID"),
});
