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
    if (index === 0) return <FaTrophy className="text-yellow-500 dark:text-yellow-400 text-xl drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />;
    if (index === 1) return <FaMedal className="text-slate-400 dark:text-slate-300 text-xl drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" />;
    if (index === 2) return <FaMedal className="text-amber-600 dark:text-amber-500 text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />;
    return <span className="text-slate-500 font-bold w-5 text-center">#{index + 1}</span>;
  };

  const getRankColor = (index) => {
    if (index === 0) return "bg-yellow-100 dark:bg-yellow-500/10 border-yellow-300 dark:border-yellow-500/30";
    if (index === 1) return "bg-slate-100 dark:bg-slate-300/10 border-slate-300 dark:border-slate-300/30";
    if (index === 2) return "bg-amber-100 dark:bg-amber-600/10 border-amber-300 dark:border-amber-600/30";
    return "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10";
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
        className="space-y-8 text-slate-900 dark:text-slate-100"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Company Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage jobs and review top talent analytics</p>
          </div>

          <div className="flex bg-slate-100 dark:bg-[#0b0f19] p-1 rounded-xl border border-slate-300 dark:border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "overview" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "jobs" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"}`}
            >
              Job Postings
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Ranking Section */}
            <motion.div
              whileHover={{ y: -4 }}
              className="lg:col-span-1 neon-card rounded-[2rem] p-8 relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
              <h3 className="mb-6 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-sm flex items-center justify-between">
                <span>Top Candidates</span>
                <FaUsers className="text-slate-400 dark:text-slate-500" />
              </h3>

              <div className="flex-1 space-y-3">
                {sortedCandidates.map((c, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={c.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-default ${getRankColor(index)}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 flex items-center justify-center w-8">
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{c.experience || "No experience set"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-lg text-fuchsia-600 dark:text-fuchsia-400 drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]">
                        {c.skillScore}%
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Score</span>
                    </div>
                  </motion.div>
                ))}
                {sortedCandidates.length === 0 && (
                  <div className="text-center py-10 text-slate-500 italic">No candidates available</div>
                )}
              </div>
            </motion.div>

            {/* Skill Comparison Graph */}
            <motion.div
              whileHover={{ y: -4 }}
              className="lg:col-span-2 neon-card rounded-[2rem] p-8 relative overflow-hidden flex flex-col min-h-[400px]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <h3 className="mb-6 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-sm flex justify-between items-center">
                <span>Skill Comparison Overview</span>
                <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold">{candidates.length} Total</span>
              </h3>

              <div className="flex-1 w-full h-full pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={30}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" className="dark:stroke-[#1e293b]" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', color: '#0f172a' }}
                      itemStyle={{ color: '#0f172a' }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} animationDuration={1500}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Postings</h2>
              <button
                onClick={() => setShowJobForm(!showJobForm)}
                className="flex items-center gap-2 btn-revolve px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >
                <FaPlus /> Post a Job
              </button>
            </div>

            <AnimatePresence>
              {showJobForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handlePostJob} className="neon-card p-6 rounded-[2rem] space-y-4 mb-6 border border-indigo-200 dark:border-indigo-500/30">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create New Job Posting</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <input
                        required
                        placeholder="Job Title (e.g., Frontend Dev)"
                        className="bg-slate-50 dark:bg-[#05050f] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                        value={newJob.title}
                        onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                      />
                      <input
                        required
                        placeholder="Department"
                        className="bg-slate-50 dark:bg-[#05050f] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                        value={newJob.department}
                        onChange={e => setNewJob({ ...newJob, department: e.target.value })}
                      />
                      <select
                        className="bg-slate-50 dark:bg-[#05050f] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                        value={newJob.type}
                        onChange={e => setNewJob({ ...newJob, type: e.target.value })}
                      >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button type="button" onClick={() => setShowJobForm(false)} className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium">Cancel</button>
                      <button type="submit" className="btn-revolve px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(217,70,239,0.4)]">Publish Job</button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="neon-card rounded-2xl p-6 group cursor-pointer hover:-translate-y-1 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
                      <FaBriefcase />
                    </div>
                    <span className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs px-2 py-1 rounded-md text-slate-700 dark:text-slate-300">
                      {job.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{job.department}</p>

                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {/* Mock applicant avatars */}
                      <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white dark:border-[#0b0f19]"></div>
                      <div className="w-8 h-8 rounded-full bg-violet-500 border-2 border-white dark:border-[#0b0f19]"></div>
                      <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-[#0b0f19] flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-white">+{job.applicants}</div>
                    </div>
                    <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300">View Applicants</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}