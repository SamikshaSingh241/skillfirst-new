import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHome,
  FaUserCheck,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen relative overflow-hidden transition-colors duration-300">

      {/* Sidebar */}
      <div className="w-72 mt-8 ml-8 mb-8 neon-card rounded-3xl hidden md:flex flex-col relative z-50">
        <div className="p-8 pb-4">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter cursor-pointer" onClick={() => navigate("/")}>
            SkillFirst
          </h2>
        </div>

        <div className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
          {currentUser?.role === "candidate" && (
            <>
              <SidebarBtn icon={<FaHome />} text="Dashboard" path="/candidate" currentPath={location.pathname} navigate={navigate} />
            </>
          )}

          {currentUser?.role === "recruiter" && (
            <>
              <SidebarBtn icon={<FaChartBar />} text="Dashboard" path="/recruiter" currentPath={location.pathname} navigate={navigate} />
            </>
          )}

          {currentUser?.role === "admin" && (
            <>
              <SidebarBtn icon={<FaUserCheck />} text="Admin Panel" path="/admin" currentPath={location.pathname} navigate={navigate} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 mt-auto">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-medium group"
          >
            <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10 w-full overflow-y-auto pt-4 md:pt-8 pr-4 md:pr-8 pb-8 pl-4 md:pl-8">
        <Navbar />
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-col flex-1"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

function SidebarBtn({ icon, text, path, currentPath, navigate }) {
  const isActive = currentPath === path;

  return (
    <button
      onClick={() => navigate(path)}
      className={`relative flex items-center gap-3 w-full px-4 py-3.5 rounded-xl font-medium transition-all duration-300 overflow-hidden ${isActive
        ? "text-slate-900 dark:text-white"
        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
    >
      {isActive && (
        <motion.div
          layoutId="active-sidebar-bg"
          className="absolute inset-0 bg-slate-200 dark:bg-white/5 rounded-xl border border-slate-300 dark:border-white/10"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <div className="relative z-10 flex items-center gap-3">
        <span className={`text-xl ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`}>{icon}</span>
        <span>{text}</span>
      </div>
    </button>
  );
}