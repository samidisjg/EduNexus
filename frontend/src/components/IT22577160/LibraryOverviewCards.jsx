import PropTypes from "prop-types";
import { Card } from "flowbite-react";
import { HiBookOpen, HiClipboardList, HiRefresh, HiSparkles } from "react-icons/hi";
import { FaBoxesStacked } from "react-icons/fa6";

const statCards = [
  {
    key: "books",
    title: "Catalog Books",
    accent: "from-cyan-500 to-blue-600",
    icon: HiBookOpen,
    valueKey: "totalBooks",
    helper: "books in the collection",
  },
  {
    key: "copies",
    title: "Available Copies",
    accent: "from-indigo-500 to-violet-600",
    icon: FaBoxesStacked,
    valueKey: "availableCopies",
    helper: "ready to borrow",
  },
  {
    key: "active",
    title: "Active Borrows",
    accent: "from-amber-500 to-orange-500",
    icon: HiRefresh,
    valueKey: "activeBorrowings",
    helper: "currently on loan",
  },
  {
    key: "records",
    title: "Borrow Records",
    accent: "from-emerald-500 to-teal-600",
    icon: HiClipboardList,
    valueKey: "totalBorrowings",
    helper: "tracking history",
  },
];

const LibraryOverviewCards = ({ stats, isStaff }) => {
  const visibleCards = isStaff ? statCards : statCards.slice(0, 2);

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {visibleCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className="group overflow-hidden border border-white/60 bg-white/80 shadow-xl shadow-slate-200/70 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/60 dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/30 dark:hover:shadow-black/40"
          >
            <div className={`rounded-[1.75rem] bg-gradient-to-br ${card.accent} p-5 text-white`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                    {card.title}
                  </p>
                  <p className="mt-4 text-4xl font-black md:text-[2.7rem]">{stats[card.valueKey]}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">
                    <HiSparkles className="text-sm" />
                    {card.helper}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/15 p-3 shadow-lg ring-1 ring-white/20">
                  <Icon className="text-4xl text-white/95" />
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {!isStaff && (
        <Card className="border border-dashed border-indigo-300 bg-indigo-50/70 shadow-none dark:border-indigo-500/40 dark:bg-indigo-900/20 md:col-span-2">
          <div className="flex items-start gap-3">
            <HiSparkles className="mt-1 text-2xl text-indigo-600 dark:text-indigo-300" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student mode enabled</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                You can browse books, borrow by book ID, and return by borrow ID. Borrowing analytics and
                full record management are reserved for staff roles to match the backend authorization rules.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

LibraryOverviewCards.propTypes = {
  stats: PropTypes.shape({
    totalBooks: PropTypes.number.isRequired,
    availableCopies: PropTypes.number.isRequired,
    activeBorrowings: PropTypes.number.isRequired,
    totalBorrowings: PropTypes.number.isRequired,
  }).isRequired,
  isStaff: PropTypes.bool.isRequired,
};

export default LibraryOverviewCards;
