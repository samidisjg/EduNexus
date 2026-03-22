import { Link } from "react-router-dom";
import { FaBookOpen, FaEnvelope, FaGraduationCap, FaPhoneAlt } from "react-icons/fa";
import { HiLibrary, HiUserGroup } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { BsFacebook, BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";

const FooterComponent = () => {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-gradient-to-br from-white via-cyan-50 to-blue-100 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-20 -left-16 h-48 w-48 rounded-full bg-cyan-300 blur-3xl dark:bg-cyan-900" />
        <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-blue-300 blur-3xl dark:bg-blue-900" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
              <FaGraduationCap className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">
                EduNexus
              </p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                Academic Suite
              </p>
            </div>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-slate-600 dark:text-slate-300">
            Connected platform for students, staff, courses, library operations, and campus workflows.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a href="#" className="text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
              <BsFacebook />
            </a>
            <a href="#" className="text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
              <BsInstagram />
            </a>
            <a href="#" className="text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
              <BsTwitter />
            </a>
            <a href="#" className="text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
              <BsLinkedin />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
            Quick Links
          </h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <Link to="/" className="block transition hover:text-cyan-600 dark:hover:text-cyan-400">
              Home
            </Link>
            <Link to="/sign-in" className="block transition hover:text-cyan-600 dark:hover:text-cyan-400">
              Sign In
            </Link>
            <Link to="/sign-up" className="block transition hover:text-cyan-600 dark:hover:text-cyan-400">
              Create Account
            </Link>
            <Link to="/dashboard" className="block transition hover:text-cyan-600 dark:hover:text-cyan-400">
              Dashboard
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
            Modules
          </h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p className="flex items-center gap-2">
              <HiUserGroup className="text-base text-cyan-600 dark:text-cyan-400" />
              Student Management
            </p>
            <p className="flex items-center gap-2">
              <FaBookOpen className="text-base text-cyan-600 dark:text-cyan-400" />
              Course Management
            </p>
            <p className="flex items-center gap-2">
              <HiLibrary className="text-base text-cyan-600 dark:text-cyan-400" />
              Library Services
            </p>
            <p className="flex items-center gap-2">
              <MdOutlineDashboard className="text-base text-cyan-600 dark:text-cyan-400" />
              Staff Dashboard
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
            Contact
          </h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p className="flex items-center gap-2">
              <FaPhoneAlt className="text-sm text-cyan-600 dark:text-cyan-400" />
              +94 11 234 5678
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-sm text-cyan-600 dark:text-cyan-400" />
              support@edunexus.edu
            </p>
            <p>Mon - Fri | 8:00 AM - 5:00 PM</p>
            <p>Colombo, Sri Lanka</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/70 px-6 py-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        © {new Date().getFullYear()} EduNexus Academic System. All rights reserved.
      </div>
    </footer>
  );
};

export default FooterComponent;
