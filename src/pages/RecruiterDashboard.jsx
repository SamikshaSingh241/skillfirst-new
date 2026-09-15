import { useContext, useEffect, useState } from "react";
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
import {
  FaTrophy,
  FaMedal,
  FaPlus,
  FaBriefcase,
  FaUsers,
  FaFilePdf,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaTrash
} from "react-icons/fa";
import { API_BASE_URL } from "../config/api";

export default function RecruiterDashboard() {
  const { users, currentUser } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("overview"); // overview, jobs, applications
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [selectedAppModal, setSelectedAppModal] = useState(null);

  // Form State for Posting Job
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [jobDescription, setJobDescription] = useState("");
  const [jdFile, setJdFile] = useState(null);

  // Fetch Jobs from backend
  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Fetch Applications from backend
  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const candidates = users.filter((u) => u.role === "candidate");
  const sortedCandidates = [...candidates].sort((a, b) => (b.skillScore || 0) - (a.skillScore || 0));

  const chartData = candidates.map((c) => ({
    name: c.name,
    score: c.skillScore || 0,
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

  // Handle Post Job with JD PDF
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim() || !department.trim()) return;

    setIsSubmittingJob(true);
    const formData = new FormData();
    formData.append("title", jobTitle.trim());
    formData.append("department", department.trim());
    formData.append("type", jobType);
    formData.append("description", jobDescription.trim());
    formData.append("recruiterName", currentUser?.name || "Hiring Manager");
    if (currentUser?._id) formData.append("postedBy", currentUser._id);
    if (jdFile) formData.append("jdFile", jdFile);

    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setJobTitle("");
        setDepartment("");
        setJobType("Full-time");
        setJobDescription("");
        setJdFile(null);
        setShowJobForm(false);
        fetchJobs();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to post job");
      }
    } catch (err) {
      console.error("Error creating job:", err);
      alert("Error posting job to server.");
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // Handle Shortlist / Reject Status Update
  const updateApplicationStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: updated.status } : app))
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setJobs(jobs.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      console.error("Failed to delete job:", err);
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
        {/* Header and Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Recruiter Command Center
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Post roles with JD PDFs, inspect AI Resume+JD assessments, and shortlist top talent
            </p>
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
              Job Postings ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "applications"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FaUsers /> Applicants ({applications.length})
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
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
                {sortedCandidates.length > 0 ? (
                  sortedCandidates.map((candidate, index) => (
                    <div
                      key={candidate._id || candidate.id || index}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${getRankColor(index)}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center">{getRankIcon(index)}</div>
                        <div>
                          <p className="font-bold text-sm text-white">{candidate.name}</p>
                          <p className="text-xs text-slate-400">{candidate.experience || "No experience specified"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-400 text-sm">{candidate.skillScore || 0}%</span>
                        <p className="text-[10px] text-slate-500 uppercase">Score</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm text-center py-8">No candidate profiles registered yet.</p>
                )}
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
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.02)" }}
                        contentStyle={{
                          backgroundColor: "#0d121f",
                          borderRadius: "1rem",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#ffffff",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                        }}
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#059669"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500 flex-col gap-3 py-16">
                    <p className="text-sm">Candidate assessment data will chart here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* TAB 2: JOB POSTINGS */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Active Job Openings</h2>
                <p className="text-xs text-slate-400 mt-0.5">Post openings with an optional Job Description PDF for targeted AI assessments</p>
              </div>
              <button
                onClick={() => setShowJobForm(!showJobForm)}
                className="btn-revolve flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all"
              >
                <FaPlus /> {showJobForm ? "Close Form" : "Post a New Job"}
              </button>
            </div>

            {/* Post Job Form Modal / Accordion */}
            <AnimatePresence>
              {showJobForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handlePostJob}
                  className="neon-card p-6 md:p-8 rounded-2xl border border-white/10 space-y-5"
                >
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="font-bold text-lg text-white">Create New Job Opening</h3>
                    <p className="text-xs text-slate-400">Attach an official JD PDF so AI can generate questions aligned to candidate resumes</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Job Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Full Stack Engineer"
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Department *</label>
                      <input
                        type="text"
                        placeholder="e.g. Core Platform Engineering"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Employment Type</label>
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Remote">Remote</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Job Overview & Key Requirements</label>
                    <textarea
                      rows="3"
                      placeholder="Outline key technical stack expectations, years of experience, responsibilities..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none resize-none"
                    />
                  </div>

                  {/* PDF Upload Field */}
                  <div className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl bg-slate-900/40 p-5 text-center transition-all cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setJdFile(e.target.files[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FaFilePdf className="text-3xl text-emerald-400" />
                      <p className="text-sm font-semibold text-white">
                        {jdFile ? `Attached: ${jdFile.name}` : "Upload Job Description PDF (Optional but Recommended)"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {jdFile ? "AI will extract requirements directly from this PDF document" : "Click to select a PDF specification file"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowJobForm(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingJob}
                      className="btn-revolve px-6 py-2.5 rounded-xl text-sm font-bold shadow-md disabled:opacity-50"
                    >
                      {isSubmittingJob ? "Parsing JD & Publishing..." : "Publish Opening"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Jobs Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id || job.id}
                  className="neon-card rounded-2xl p-6 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.05)] hover:-translate-y-1 transition-transform relative group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-white mb-1">{job.title}</h3>
                      <p className="text-xs text-slate-400">
                        {job.department} • <span className="text-emerald-400">{job.type}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
                        Active
                      </span>
                      {job._id && (
                        <button
                          onClick={() => deleteJob(job._id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1 text-xs"
                          title="Delete Job"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-xs text-slate-300 line-clamp-2 mb-3 bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                      {job.description}
                    </p>
                  )}

                  {job.jdFileName && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/30 border border-cyan-500/20 px-2.5 py-1 rounded-md mb-3">
                      <FaFilePdf /> JD Document: {job.jdFileName}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-white/5 pt-4 mt-2">
                    <span className="font-medium">
                      {job.applicantsCount || 0} Applicant{job.applicantsCount === 1 ? "" : "s"} Evaluated
                    </span>
                    <button
                      onClick={() => setActiveTab("applications")}
                      className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                    >
                      Review Candidates &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: APPLICANTS / CANDIDATE EVALUATIONS (SHORTLIST / REJECT) */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Candidate Applications & Results</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review AI Resume+JD test scores, inspect evaluations, and shortlist or reject candidates
                </p>
              </div>
              <button
                onClick={fetchApplications}
                className="text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                Refresh List
              </button>
            </div>

            {loadingApps ? (
              <div className="neon-card p-12 text-center text-slate-400">Loading candidate evaluations...</div>
            ) : applications.length === 0 ? (
              <div className="neon-card p-12 text-center rounded-2xl border border-white/10 text-slate-400">
                <FaUsers className="text-4xl text-slate-600 mx-auto mb-3" />
                <p className="font-bold text-white mb-1">No Applications Received Yet</p>
                <p className="text-xs">When candidates apply for your posted jobs, their Resume+JD test results will appear here for shortlisting.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="neon-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-white">{app.candidateName}</h3>
                        <span className="text-xs text-slate-400">({app.candidateEmail})</span>
                        
                        {/* Status Badge */}
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                            app.status === "Shortlisted"
                              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                              : app.status === "Rejected"
                              ? "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                              : "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                          }`}
                        >
                          {app.status === "Shortlisted" && <FaCheckCircle />}
                          {app.status === "Rejected" && <FaTimesCircle />}
                          {app.status === "In Progress" && <FaClock />}
                          {app.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">
                        Applied for: <span className="font-bold text-white">{app.jobTitle}</span> •{" "}
                        <span className="text-slate-500">{new Date(app.appliedAt).toLocaleDateString()}</span>
                      </p>

                      {app.assessmentSummary && (
                        <p className="text-xs text-slate-400 max-w-2xl line-clamp-1 italic">
                          "{app.assessmentSummary}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Score Badge */}
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Test Score</p>
                        <p className="text-2xl font-black text-emerald-400">{app.score || 0}%</p>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => setSelectedAppModal(app)}
                        className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-white/10 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <FaEye /> Details
                      </button>

                      {/* Recruiter Action Buttons: Shortlist or Reject */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateApplicationStatus(app._id, "Shortlisted")}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            app.status === "Shortlisted"
                              ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                          }`}
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(app._id, "Rejected")}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            app.status === "Rejected"
                              ? "bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                              : "bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                          }`}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Application Detail Modal */}
            <AnimatePresence>
              {selectedAppModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="neon-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 rounded-3xl border border-white/15 space-y-5"
                  >
                    <div className="flex justify-between items-start border-b border-white/10 pb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{selectedAppModal.candidateName}</h3>
                        <p className="text-xs text-slate-400">{selectedAppModal.candidateEmail} • Role: {selectedAppModal.jobTitle}</p>
                      </div>
                      <button
                        onClick={() => setSelectedAppModal(null)}
                        className="text-slate-400 hover:text-white text-lg font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Current Status</p>
                        <p className="text-base font-bold text-emerald-400">{selectedAppModal.status}</p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Verified Assessment Score</p>
                        <p className="text-base font-bold text-white">{selectedAppModal.score}%</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">AI Alignment Analysis</h4>
                      <p className="text-xs text-slate-200 bg-slate-950/60 p-3.5 rounded-xl border border-white/5 leading-relaxed">
                        {selectedAppModal.assessmentSummary || "AI verified candidate credentials against JD requirements."}
                      </p>
                    </div>

                    {selectedAppModal.questions && selectedAppModal.questions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                          Resume+JD Calibrated Questions Sample ({selectedAppModal.questions.length} total)
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {selectedAppModal.questions.slice(0, 4).map((q, idx) => (
                            <div key={idx} className="bg-slate-900/40 p-2.5 rounded-lg border border-white/5 text-xs">
                              <p className="font-semibold text-white">{idx + 1}. {q.question}</p>
                              <p className="text-emerald-400 text-[11px] mt-1">Correct: {q.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                      <button
                        onClick={() => {
                          updateApplicationStatus(selectedAppModal._id, "Shortlisted");
                          setSelectedAppModal(null);
                        }}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
                      >
                        Shortlist Candidate
                      </button>
                      <button
                        onClick={() => {
                          updateApplicationStatus(selectedAppModal._id, "Rejected");
                          setSelectedAppModal(null);
                        }}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}