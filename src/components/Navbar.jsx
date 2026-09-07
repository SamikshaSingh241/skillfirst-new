import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle, FaBell } from "react-icons/fa";

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
    <div className="h-20 px-8 flex items-center justify-between neon-card mb-6 rounded-2xl sticky top-4 z-40 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.06)] backdrop-blur-xl">
      <div className="font-semibold text-slate-400 text-sm">
        {greeting}, <span className="text-emerald-400 font-bold">{currentUser?.name?.split(' ')[0] || 'Guest'}</span>! 👋
      </div>

      {currentUser && (
        <div className="flex items-center gap-6">
          <button className="relative text-slate-400 hover:text-emerald-400 transition-colors p-2 rounded-xl hover:bg-white/5">
            <FaBell className="text-lg" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
          </button>

          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors leading-tight">{currentUser.name}</p>
              <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <FaUserCircle className="text-2xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}