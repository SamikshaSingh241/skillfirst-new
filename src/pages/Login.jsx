import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaArrowLeft, FaExclamationCircle } from "react-icons/fa";

export default function Login() {
  const { login, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const rolePathMap = {
    admin: "/admin",
    candidate: "/candidate",
    recruiter: "/recruiter",
  };

  useEffect(() => {
    if (currentUser) {
      navigate(rolePathMap[currentUser.role] || "/", { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login(email.trim(), password.trim());
      // Small artificially delay just for the UI feeling as previously styled
      setTimeout(() => {
        navigate(rolePathMap[user.role] || "/", { replace: true });
      }, 100);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-[#05050f] text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* Decorative Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-fuchsia-600/10 dark:bg-fuchsia-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-violet-600/10 dark:bg-violet-600/10 blur-[150px] pointer-events-none" />

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium transition-colors z-20"
      >
        <FaArrowLeft /> Back to Home
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="neon-card rounded-[2rem] p-10 md:p-12">

          <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-3 tracking-tight text-slate-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Sign in to your SkillFirst account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className="w-full bg-slate-100 dark:bg-[#05050f] border border-slate-300 dark:border-white/10 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-100 dark:focus:ring-fuchsia-500/10 rounded-2xl py-4 pl-11 pr-4 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white font-medium shadow-inner"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-100 dark:bg-[#05050f] border border-slate-300 dark:border-white/10 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-100 dark:focus:ring-fuchsia-500/10 rounded-2xl py-4 pl-11 pr-4 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white font-medium shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <p className="flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 p-4 rounded-2xl text-sm font-medium" role="alert">
                    <FaExclamationCircle className="shrink-0" />
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-revolve text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 shadow-md dark:shadow-none hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 relative overflow-hidden"
            >
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </motion.div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-700 dark:hover:text-fuchsia-300 font-bold transition-colors"
            >
              Sign up here.
            </button>
          </p>

        </div>
      </motion.div>
    </div>
  );
}
