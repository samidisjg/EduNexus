export const normalizeRole = (role) => (role || "").trim().toUpperCase();

export const isStaffRole = (role) => ["ADMIN", "INSTRUCTOR"].includes(normalizeRole(role));

export const isAuthenticatedRole = (role) =>
  ["ADMIN", "INSTRUCTOR", "USER"].includes(normalizeRole(role));

export const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
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

export const getRoleBadgeClass = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "ADMIN") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200";
  }

  if (normalizedRole === "INSTRUCTOR") {
    return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200";
  }

  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200";
};

export const getBorrowStatusClass = (status) => {
  if (status === "RETURNED") {
    return "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200";
  }

  return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200";
};

export const getFineStatusClass = (status) => {
  if (status === "PAID") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200";
  }

  if (status === "PENDING") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200";
  }

  return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200";
};
