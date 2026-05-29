import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle, FaBell } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Navbar() {
  const { currentUser } = useContext(AuthContext);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  return (
    <div className="h-20 px-8 flex items-center justify-between neon-card m-4 md:m-8 rounded-2xl sticky top-4 md:top-8 z-40">
      <div className="font-semibold text-slate-500 dark:text-slate-400">
        {greeting}, <span className="text-indigo-600 dark:text-indigo-400">{currentUser?.name?.split(' ')[0] || 'Guest'}</span>! 👋
      </div>

      {currentUser && (
        <div className="flex items-center gap-6">
          <button className="relative text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <FaBell className="text-xl" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#0b0f19]" />
          </button>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{currentUser.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{currentUser.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FaUserCircle className="text-2xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}