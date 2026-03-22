import PropTypes from "prop-types";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaBook,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaGraduationCap,
  FaHome,
  FaMoneyBillWave,
  FaSchool,
  FaSignOutAlt,
  FaThLarge,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import { signOutSuccess } from "../redux/user/userSlice";
import authService from "../services/auth.service";

const dashboardSections = [
  {
    key: "student",
    label: "Student",
    icon: FaUsers,
    children: [
      { to: "/dashboard/student/course", label: "Course", icon: FaBook },
      { to: "/dashboard/student/library", label: "Library", icon: FaSchool },
    ],
  },
  {
    key: "staff",
    label: "Staff",
    icon: FaUserTie,
    children: [
      {
        key: "staff-course-faculties",
        label: "All Programs",
        icon: FaBook,
        to: "/dashboard/staff/course",
        children: [
          { to: "/dashboard/staff/course/FOC", label: "FOC", icon: FaBook },
          { to: "/dashboard/staff/course/FOE", label: "FOE", icon: FaBook },
          { to: "/dashboard/staff/course/FOM", label: "FOM", icon: FaBook },
          { to: "/dashboard/staff/course/FOH", label: "FOH", icon: FaBook },
          { to: "/dashboard/staff/course/FOA", label: "FOA", icon: FaBook },
        ],
      },
      { to: "/dashboard/staff/library", label: "Library", icon: FaSchool },
      { to: "/dashboard/staff/course", label: "Course", icon: FaBook },
      { to: "/library", label: "Library", icon: FaSchool },
      { to: "/fines", label: "Fines", icon: FaMoneyBillWave },
    ],
  },
];

const SideNav = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [openSections, setOpenSections] = useState({
    student: true,
    staff: true,
    "staff-course-faculties": true,
  });

  const handleSignOut = () => {
    authService.signOut();
    dispatch(signOutSuccess());
    navigate("/sign-in");
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderNavItems = (items, depth = 0) =>
    items.map((item) => {
      if (item.children) {
        const ItemIcon = item.icon;
        const isGroupActive =
          location.pathname === item.to || item.children.some((child) => location.pathname === child.to);

        return (
          <div key={item.key || item.label} className="space-y-1">
            <div
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                isGroupActive
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-slate-600 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400"
              } ${depth > 0 ? "font-medium" : "font-semibold"}`}
            >
              <Link to={item.to || "#"} className="flex min-w-0 flex-1 items-center gap-3">
                <ItemIcon className="text-sm shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
              <button
                type="button"
                onClick={() => toggleSection(item.key)}
                className="rounded-md p-1"
              >
                <FaChevronDown
                  className={`text-xs transition-transform ${openSections[item.key] ? "rotate-180" : "rotate-0"}`}
                />
              </button>
            </div>

            {openSections[item.key] ? (
              <div className={depth > 0 ? "space-y-1 pl-5" : "space-y-1 pl-6"}>
                {renderNavItems(item.children, depth + 1)}
              </div>
            ) : null}
          </div>
        );
      }

      const ItemIcon = item.icon;
      const isActive = location.pathname === item.to;

      return (
        <Link
          key={item.to}
          to={item.to}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
            isActive
              ? "text-cyan-600 dark:text-cyan-400"
              : "text-slate-600 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400"
          } ${depth > 1 ? "pl-2" : ""}`}
        >
          <ItemIcon className="text-sm shrink-0" />
          <span>{item.label}</span>
        </Link>
      );
    });

  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/35 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onToggle}
      />

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white/95 dark:border-slate-700 dark:bg-slate-900/95 ${
          isOpen ? "translate-x-0 w-72" : "-translate-x-full w-72 lg:translate-x-0 lg:w-28"
        } transition-all duration-300 lg:translate-x-0`}
      >
        <div className={`flex items-center border-b border-slate-200 px-5 py-5 dark:border-slate-700 ${isOpen ? "justify-between" : "flex-col gap-4"}`}>
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 text-white shadow-lg">
              <FaGraduationCap className="text-2xl" />
            </div>
            <div className={`${isOpen ? "block" : "hidden lg:hidden"}`}>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">
                EduNexus
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Campus Desk
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onToggle}
            className={`rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 ${isOpen ? "block" : "hidden lg:block"}`}
          >
            {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
          <Link
            to="/"
            className={`flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              location.pathname === "/"
                ? "text-cyan-600 dark:text-cyan-400"
                : "text-slate-700 hover:text-cyan-600 dark:text-slate-200 dark:hover:text-cyan-400"
            } ${isOpen ? "gap-4" : "justify-center"}`}
          >
            <FaHome className="text-[1.35rem] shrink-0" />
            <span className={`${isOpen ? "block" : "hidden lg:hidden"}`}>Home</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsDashboardOpen((prev) => !prev)}
            className={`flex w-full items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isDashboardRoute
                ? "text-cyan-600 dark:text-cyan-400"
                : "text-slate-700 hover:text-cyan-600 dark:text-slate-200 dark:hover:text-cyan-400"
            } ${isOpen ? "gap-4" : "justify-center"}`}
          >
            <FaThLarge className="text-[1.35rem] shrink-0" />
            <span className={`${isOpen ? "block flex-1 text-left" : "hidden lg:hidden"}`}>Dashboard</span>
            {isOpen ? <FaChevronDown className={`text-xs transition-transform ${isDashboardOpen ? "rotate-180" : "rotate-0"}`} /> : null}
          </button>

          {isOpen && isDashboardOpen ? (
            <div className="space-y-1 pl-4">
              {dashboardSections.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <div key={section.key} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.key)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:text-cyan-600 dark:text-slate-200 dark:hover:text-cyan-400"
                    >
                      <SectionIcon className="text-base shrink-0" />
                      <span className="flex-1">{section.label}</span>
                      <FaChevronDown className={`text-xs transition-transform ${openSections[section.key] ? "rotate-180" : "rotate-0"}`} />
                    </button>

                    {openSections[section.key] ? (
                      <div className="space-y-1 pl-6">{renderNavItems(section.children)}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-700">
          <button
            type="button"
            onClick={handleSignOut}
            className={`flex w-full items-center rounded-2xl px-4 py-3 text-sm font-semibold text-rose-600 transition hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 ${isOpen ? "gap-4" : "justify-center"}`}
          >
            <FaSignOutAlt className="text-[1.35rem] shrink-0" />
            <span className={`${isOpen ? "block" : "hidden lg:hidden"}`}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

SideNav.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default SideNav;
