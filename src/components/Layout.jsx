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
    <div className="flex min-h-screen relative overflow-hidden bg-[#080c14] text-slate-100 transition-colors duration-300">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Sidebar */}
      <div className="w-72 mt-6 ml-6 mb-6 neon-card rounded-3xl hidden md:flex flex-col relative z-50 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(16,185,129,0.06)]">
        <div className="p-8 pb-4">
          <h2 className="text-3xl font-black tracking-tighter cursor-pointer flex items-center gap-2" onClick={() => navigate("/")}>
            <span className="neon-text-gradient">SkillFirst</span>
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

        <div className="p-4 border-t border-white/5 mt-auto">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium group"
          >
            <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform text-slate-400 group-hover:text-emerald-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10 w-full overflow-y-auto pt-4 md:pt-6 pr-4 md:pr-6 pb-6 pl-4 md:pl-6">
        <Navbar />
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
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
      className={`relative flex items-center gap-3 w-full px-4 py-3.5 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
        isActive
          ? "text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="active-sidebar-bg"
          className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/30"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <div className="relative z-10 flex items-center gap-3">
        <span className={`text-xl ${isActive ? "text-emerald-400" : "text-slate-500"}`}>{icon}</span>
        <span className="font-semibold text-sm">{text}</span>
      </div>
    </button>
  );
}