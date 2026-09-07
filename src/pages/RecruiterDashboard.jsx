import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import { FaTrophy, FaMedal, FaPlus, FaBriefcase, FaUsers } from "react-icons/fa";

export default function RecruiterDashboard() {
  const { users } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("overview");
  const [jobs, setJobs] = useState([
    { id: 1, title: "Senior Frontend Engineer", department: "Engineering", type: "Full-time", applicants: 12 },
    { id: 2, title: "Product Designer", department: "Design", type: "Contract", applicants: 5 }
  ]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", department: "", type: "Full-time" });

  const candidates = users.filter((u) => u.role === "candidate");
  const sortedCandidates = [...candidates].sort((a, b) => b.skillScore - a.skillScore);

  const chartData = candidates.map((c) => ({
    name: c.name,
    score: c.skillScore,
  }));

  const getRankIcon = (index) => {
    if (index === 0) return <FaTrophy className="text-yellow-400 text-xl drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />;
    if (index === 1) return <FaMedal className="text-slate-300 text-xl drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" />;
    if (index === 2) return <FaMedal className="text-amber-500 text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />;
    return <span className="text-slate-500 font-bold w-5 text-center">#{index + 1}</span>;
  };

  const getRankColor = (index) => {
    if (index === 0) return "bg-yellow-500/10 border-yellow-500/30";
    if (index === 1) return "bg-slate-400/10 border-slate-400/30";
    if (index === 2) return "bg-amber-500/10 border-amber-500/30";
    return "bg-slate-900/60 border-white/10";
  };

  const handlePostJob = (e) => {
    e.preventDefault();
    if (newJob.title && newJob.department) {
      setJobs([...jobs, { ...newJob, id: Date.now(), applicants: 0 }]);
      setNewJob({ title: "", department: "", type: "Full-time" });
      setShowJobForm(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 text-slate-100"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Recruiter Dashboard
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Manage listings and review verified candidate benchmarks</p>
          </div>

          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-xl self-start md:self-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "overview" 
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "jobs" 
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Job Postings
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Ranking Section */}
            <motion.div
              whileHover={{ y: -3 }}
              className="lg:col-span-1 neon-card rounded-[2rem] p-8 relative overflow-hidden flex flex-col border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.06)]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <h3 className="mb-6 text-slate-400 font-semibold uppercase tracking-wider text-xs flex items-center justify-between">
                <span>Top Candidate Rankings</span>
                <FaUsers className="text-slate-500" />
              </h3>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-1">
                {sortedCandidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${getRankColor(index)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">{getRankIcon(index)}</div>
                      <div>
                        <p className="font-bold text-sm text-white">{candidate.name}</p>
                        <p className="text-xs text-slate-400">{candidate.experience || "No title specified"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-400 text-sm">{candidate.skillScore}%</span>
                      <p className="text-[10px] text-slate-500 uppercase">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Score Distribution Chart */}
            <motion.div
              whileHover={{ y: -3 }}
              className="lg:col-span-2 neon-card rounded-[2rem] p-8 relative overflow-hidden flex flex-col border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.06)]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
              <h3 className="mb-6 text-slate-400 font-semibold uppercase tracking-wider text-xs">
                Candidate Score Distribution
              </h3>

              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ 
                        backgroundColor: '#0d121f', 
                        borderRadius: '1rem', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: '#ffffff',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#059669"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Active Openings</h2>
              <button
                onClick={() => setShowJobForm(!showJobForm)}
                className="btn-revolve flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all"
              >
                <FaPlus /> Post a Job
              </button>
            </div>

            <AnimatePresence>
              {showJobForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handlePostJob}
                  className="neon-card p-6 rounded-2xl border border-white/10 space-y-4"
                >
                  <h3 className="font-bold text-white">New Job Details</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Job Title"
                      required
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      className="bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Department"
                      required
                      value={newJob.department}
                      onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                      className="bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                    />
                    <select
                      value={newJob.type}
                      onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                      className="bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowJobForm(false)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-revolve px-5 py-2 rounded-xl text-sm font-bold shadow-md"
                    >
                      Publish Role
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="grid md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="neon-card rounded-2xl p-6 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.05)] hover:-translate-y-1 transition-transform"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-white mb-1">{job.title}</h3>
                      <p className="text-xs text-slate-400">{job.department} • {job.type}</p>
                    </div>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-white/5 pt-4 mt-4">
                    <span>{job.applicants} Applicants Screened</span>
                    <button className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                      Review Talent &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}