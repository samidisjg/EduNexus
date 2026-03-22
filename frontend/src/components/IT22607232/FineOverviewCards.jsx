import PropTypes from "prop-types";
import { HiCash, HiCheckCircle, HiClipboardList, HiClock, HiSparkles } from "react-icons/hi";
import { formatCurrency } from "../../utils/IT22607232/fineHelpers";

const statCards = [
  {
    key: "totalFines",
    title: "Ledger Entries",
    helper: "fines currently in scope",
    icon: HiClipboardList,
    accent: "from-amber-500 via-orange-500 to-rose-500",
    formatter: (value) => value,
  },
  {
    key: "pendingCount",
    title: "Pending Settlements",
    helper: "awaiting payment",
    icon: HiClock,
    accent: "from-rose-500 via-orange-500 to-amber-500",
    formatter: (value) => value,
  },
  {
    key: "pendingAmount",
    title: "Outstanding Value",
    helper: "exact amount due",
    icon: HiCash,
    accent: "from-amber-400 via-yellow-500 to-lime-500",
    formatter: formatCurrency,
  },
  {
    key: "recoveredAmount",
    title: "Recovered Value",
    helper: "already settled",
    icon: HiCheckCircle,
    accent: "from-emerald-500 via-teal-500 to-cyan-500",
    formatter: formatCurrency,
  },
];

const FineOverviewCards = ({ stats, scopeLabel, isStaff, activeStudentId }) => {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
      <div className="grid gap-5 md:grid-cols-2">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.key}
              className="fine-snapshot-card bg-white/75 backdrop-blur dark:bg-slate-900/80"
            >
              <div className={`rounded-[1.6rem] bg-gradient-to-br ${card.accent} p-5 text-white`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">{card.title}</p>
                    <p className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                      {card.formatter(stats[card.key])}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">
                      <HiSparkles className="text-sm" />
                      {card.helper}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
                    <Icon className="text-4xl text-white/95" />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <article className="fine-snapshot-card bg-slate-950 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">Live scope</p>
        <h3 className="mt-3 text-3xl font-black leading-tight">{scopeLabel}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {isStaff
            ? "Staff mode can open the full fines ledger, drill into one student, or isolate a single fine for settlement tracking."
            : "Student-safe mode keeps the experience focused on searching your own fine ledger and settling outstanding balances quickly."}
        </p>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200/80">Service notes</p>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <p>Payments use the backend exact-match validation, so the UI keeps the required amount aligned to the selected fine.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
              <p>
                {activeStudentId
                  ? `Student ledger loaded for ${activeStudentId}.`
                  : "Load a student ledger or pick a fine ID to activate the settlement console."}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

FineOverviewCards.propTypes = {
  stats: PropTypes.shape({
    totalFines: PropTypes.number.isRequired,
    pendingCount: PropTypes.number.isRequired,
    paidCount: PropTypes.number.isRequired,
    pendingAmount: PropTypes.number.isRequired,
    recoveredAmount: PropTypes.number.isRequired,
  }).isRequired,
  scopeLabel: PropTypes.string.isRequired,
  isStaff: PropTypes.bool.isRequired,
  activeStudentId: PropTypes.string.isRequired,
};

export default FineOverviewCards;
