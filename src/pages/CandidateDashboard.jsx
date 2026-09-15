import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  FaUpload,
  FaFileAlt,
  FaEdit,
  FaSave,
  FaChartBar,
  FaGraduationCap,
  FaComments,
  FaBriefcase,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFilePdf,
  FaArrowRight
} from "react-icons/fa";
import TestPage from "./TestPage";
import InterviewPrep from "../components/InterviewPrep";
import { API_BASE_URL } from "../config/api";

export default function CandidateDashboard() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [experience, setExperience] = useState(currentUser?.experience || "");
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // overview, jobs, applications, assessment, interview
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [activeApplicationId, setActiveApplicationId] = useState(null);

  // Available Jobs & Candidate Applications State
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);

  // Apply Modal State
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [applicationResume, setApplicationResume] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  // Manual Entry States
  const [manualMode, setManualMode] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState("");

  const chartData =
    currentUser?.scoreHistory?.map((score, index) => ({
      attempt: index + 1,
      score,
    })) || [];

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

  // Fetch Candidate's Applications
  const fetchCandidateApplications = async () => {
    if (!currentUser?._id) return;
    setLoadingApps(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/candidate/${currentUser._id}`);
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
    if (currentUser?._id) {
      fetchCandidateApplications();
    }
  }, [currentUser]);

  const handleSaveProfile = () => {
    updateUser({
      ...currentUser,
      experience,
    });
    setEditing(false);
  };

  // General Resume Upload (Direct Self-Assessment)
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedDocs([...uploadedDocs, file.name]);
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetRole", targetRole.trim() || "Software Developer");

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setAssessmentData(data);
        setActiveApplicationId(null);
        setActiveTab("assessment");
      } else {
        console.error("AI Analysis failed:", data.error);
        alert(data.error || "Failed to analyze resume.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to connect to the server for upload.");
    } finally {
      setIsAnalyzing(false);
      e.target.value = "";
    }
  };

  // Apply to a specific Recruiter Job with Resume PDF (Resume + JD Quiz Generation)
  const handleApplyToJob = async (e) => {
    e.preventDefault();
    if (!selectedJobToApply || !applicationResume) {
      alert("Please upload your resume PDF to complete your application.");
      return;
    }

    setIsApplying(true);
    const formData = new FormData();
    formData.append("resume", applicationResume);
    formData.append("jobId", selectedJobToApply._id);
    formData.append("candidateId", currentUser?._id || "");
    formData.append("candidateName", currentUser?.name || "Candidate");
    formData.append("candidateEmail", currentUser?.email || "");

    try {
      const response = await fetch(`${API_BASE_URL}/api/applications/apply`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setAssessmentData(data.assessment);
        setActiveApplicationId(data.application._id);
        setSelectedJobToApply(null);
        setApplicationResume(null);
        fetchCandidateApplications();
        fetchJobs();
        // Transition straight to Assessment
        setActiveTab("assessment");
      } else {
        alert(data.error || "Failed to submit application.");
      }
    } catch (err) {
      console.error("Application error:", err);
      alert("Error submitting application. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleManualGenerate = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim() || !skills.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-from-skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, skills }),
      });

      const data = await response.json();
      if (response.ok) {
        setAssessmentData(data);
        setActiveApplicationId(null);
        setActiveTab("assessment");
      } else {
        console.error("AI Analysis failed:", data.error);
        alert(data.error || "Failed to generate assessment.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      alert("Failed to connect to the server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Top Header & Tab Navigation */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Candidate Portal
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Explore jobs, apply with resume, complete Resume+JD tests, and track status
            </p>
          </div>

          <div className="flex flex-wrap bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${
                activeTab === "overview"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab("jobs");
                fetchJobs();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${
                activeTab === "jobs"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FaBriefcase /> Explore Jobs ({jobs.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("applications");
                fetchCandidateApplications();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${
                activeTab === "applications"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FaClock /> My Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("assessment")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${
                activeTab === "assessment"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FaGraduationCap /> Assessment
            </button>
            <button
              onClick={() => setActiveTab("interview")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${
                activeTab === "interview"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FaComments /> Interview Prep
            </button>
          </div>
        </div>

        {/* TAB 1: ASSESSMENT */}
        {activeTab === "assessment" ? (
          <div className="mt-8">
            <TestPage
              customQuestions={assessmentData?.questions}
              applicationId={activeApplicationId}
            />
          </div>
        ) : activeTab === "interview" ? (
          /* TAB 2: INTERVIEW PREP */
          <div className="mt-8">
            <InterviewPrep questions={assessmentData?.interviewQuestions} />
          </div>
        ) : activeTab === "jobs" ? (
          /* TAB 3: EXPLORE JOBS (POSTED BY RECRUITERS) */
          <div className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Available Recruiter Openings</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Apply directly with your resume PDF to generate an AI assessment tailored to the Job Description
                </p>
              </div>
              <button
                onClick={fetchJobs}
                className="text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                Refresh Jobs
              </button>
            </div>

            {loadingJobs ? (
              <div className="neon-card p-12 text-center text-slate-400 rounded-2xl">Loading recruiter openings...</div>
            ) : jobs.length === 0 ? (
              <div className="neon-card p-12 text-center rounded-2xl border border-white/10 text-slate-400">
                <FaBriefcase className="text-4xl text-slate-600 mx-auto mb-3" />
                <p className="font-bold text-white mb-1">No Active Openings Right Now</p>
                <p className="text-xs">Recruiters have not posted any positions yet. Check back shortly!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job._id || job.id}
                    className="neon-card rounded-2xl p-6 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.05)] hover:-translate-y-1 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2.5">
                        <div>
                          <h3 className="font-bold text-lg text-white">{job.title}</h3>
                          <p className="text-xs text-slate-400">
                            {job.department} • <span className="text-emerald-400 font-semibold">{job.type}</span>
                          </p>
                        </div>
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                          Hiring
                        </span>
                      </div>

                      {job.description && (
                        <p className="text-xs text-slate-300 line-clamp-3 mb-3 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                          {job.description}
                        </p>
                      )}

                      {job.jdFileName && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/30 border border-cyan-500/20 px-2.5 py-1 rounded-md mb-3">
                          <FaFilePdf /> Official JD PDF Attached ({job.jdFileName})
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Posted by {job.recruiterName || "Hiring Team"}
                      </span>
                      <button
                        onClick={() => setSelectedJobToApply(job)}
                        className="btn-revolve text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 hover:scale-105 transition-all"
                      >
                        Apply & Start Assessment <FaArrowRight />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Application Modal */}
            <AnimatePresence>
              {selectedJobToApply && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="neon-card w-full max-w-lg p-6 md:p-8 rounded-3xl border border-white/15 space-y-5"
                  >
                    <div className="flex justify-between items-start border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">Apply for {selectedJobToApply.title}</h3>
                        <p className="text-xs text-slate-400">{selectedJobToApply.department} • {selectedJobToApply.type}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedJobToApply(null);
                          setApplicationResume(null);
                        }}
                        className="text-slate-400 hover:text-white text-lg font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Upload your PDF resume. Our AI will analyze your resume against this job's requirements and immediately generate a 15-question scenario quiz and tailored interview questions.
                    </p>

                    <div className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl bg-slate-900/40 p-6 text-center transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf"
                        required
                        onChange={(e) => setApplicationResume(e.target.files[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isApplying}
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FaUpload className="text-3xl text-emerald-400" />
                        <p className="text-sm font-semibold text-white">
                          {applicationResume ? `Selected: ${applicationResume.name}` : "Upload Resume PDF"}
                        </p>
                        <p className="text-xs text-slate-400">PDF documents only</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJobToApply(null);
                          setApplicationResume(null);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                        disabled={isApplying}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApplyToJob}
                        disabled={isApplying || !applicationResume}
                        className="btn-revolve px-6 py-2.5 rounded-xl text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-2"
                      >
                        {isApplying ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Synthesizing Resume + JD Quiz...
                          </>
                        ) : (
                          "Submit & Begin Assessment"
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        ) : activeTab === "applications" ? (
          /* TAB 4: MY APPLICATIONS & LIVE STATUS (IN PROGRESS, SHORTLISTED, REJECTED) */
          <div className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">My Job Applications</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track your real-time recruitment status: In Progress, Shortlisted, or Rejected
                </p>
              </div>
              <button
                onClick={fetchCandidateApplications}
                className="text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                Refresh Status
              </button>
            </div>

            {loadingApps ? (
              <div className="neon-card p-12 text-center text-slate-400 rounded-2xl">Loading your applications...</div>
            ) : applications.length === 0 ? (
              <div className="neon-card p-12 text-center rounded-2xl border border-white/10 text-slate-400">
                <FaClock className="text-4xl text-slate-600 mx-auto mb-3" />
                <p className="font-bold text-white mb-1">No Applications Submitted Yet</p>
                <p className="text-xs mb-4">Go to the "Explore Jobs" tab to apply for open positions.</p>
                <button
                  onClick={() => setActiveTab("jobs")}
                  className="btn-revolve px-5 py-2 rounded-xl text-xs font-bold text-white"
                >
                  Browse Openings
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="neon-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-white">{app.jobTitle}</h3>
                        
                        {/* Live Application Status Badge */}
                        <span
                          className={`text-xs px-3 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            app.status === "Shortlisted"
                              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
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

                      <p className="text-xs text-slate-400">
                        Applied on {new Date(app.appliedAt).toLocaleDateString()} • Resume: {app.resumeFileName}
                      </p>

                      {app.assessmentSummary && (
                        <p className="text-xs text-slate-300 max-w-2xl italic bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                          "{app.assessmentSummary}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Assessment Score</p>
                        <p className="text-2xl font-black text-emerald-400">{app.score || 0}%</p>
                      </div>

                      {app.status === "Shortlisted" ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-300 font-bold">
                          🎉 Shortlisted for Interview
                        </div>
                      ) : app.status === "Rejected" ? (
                        <div className="bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs text-rose-400">
                          Not Selected
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs text-amber-300">
                          Recruiter Review Pending
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TAB 5: OVERVIEW */
          <>
            {/* Top Grid */}
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              {/* Progress Ring */}
              <motion.div
                whileHover={{ y: -3 }}
                className="neon-card rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
                <h3 className="mb-8 text-slate-400 font-semibold uppercase tracking-wider text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                  Verified Skill Score
                </h3>
                <ProgressRing percentage={currentUser?.skillScore || 0} />
              </motion.div>

              {/* Profile Editor */}
              <motion.div
                whileHover={{ y: -3 }}
                className="neon-card rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-center"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-emerald-500" />
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-xs">
                    Professional Profile
                  </h3>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-emerald-400 hover:text-emerald-300 p-2 rounded-xl hover:bg-white/5 transition-colors"
                      title="Edit Profile"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {editing ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Experience & Role Summary</label>
                        <input
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-3 px-4 outline-none transition-all text-white font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                          placeholder="e.g., 2 Years - Frontend Developer"
                        />
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center justify-center gap-2 w-full btn-revolve text-white font-bold py-3 rounded-xl hover:opacity-95 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.35)]"
                      >
                        <FaSave /> Save Changes
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Current Experience Level</p>
                      <p className="text-2xl font-bold text-white mb-4">
                        {currentUser?.experience || "Not specified yet"}
                      </p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Your profile experience is used alongside your resume to generate role-calibrated assessments.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-8">
              {/* Document Upload & Self Assessment */}
              <motion.div
                whileHover={{ y: -3 }}
                className="md:col-span-1 neon-card rounded-[2rem] p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-xs">
                    {manualMode ? "Manual Skills Assessment" : "Direct Resume Assessment"}
                  </h3>
                  <button
                    onClick={() => setManualMode(!manualMode)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {manualMode ? "Upload Resume Instead" : "No Resume?"}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {manualMode ? (
                    <motion.form
                      key="manual"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleManualGenerate}
                      className="space-y-4 mb-4"
                    >
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">Target Job Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Senior React Developer"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">Key Skills & Experience</label>
                        <textarea
                          required
                          rows="3"
                          placeholder="e.g., 3 years with React, Next.js, TypeScript, PostgreSQL, microservices architecture..."
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder-slate-500 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isAnalyzing}
                        className="w-full btn-revolve text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.35)] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generating Medium-Hard Quiz...
                          </>
                        ) : (
                          "Generate Assessment"
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                            Target Role <span className="text-slate-500 font-normal">(e.g. Frontend Dev, Cloud Engineer)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Full Stack Engineer"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                          />
                        </div>

                        <div className="relative border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl bg-slate-900/40 p-6 text-center transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={isAnalyzing}
                          />
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                            {isAnalyzing ? (
                              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FaUpload />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-white">
                            {isAnalyzing ? "Scanning PDF & Crafting Assessment..." : "Click or Drop PDF Resume"}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">AI extracts skills & generates role-specific MCQs</p>
                        </div>
                      </div>

                      {uploadedDocs.length > 0 && (
                        <ul className="space-y-2.5">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Uploaded Documents</p>
                          {uploadedDocs.map((doc, index) => (
                            <motion.li
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={index}
                              className="flex items-center gap-3 bg-slate-900/60 border border-white/10 p-3 rounded-xl shadow-sm"
                            >
                              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <FaFileAlt />
                              </div>
                              <span className="text-sm font-medium text-slate-200 truncate">{doc}</span>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Analytics Chart */}
              <motion.div
                whileHover={{ y: -3 }}
                className="md:col-span-2 neon-card rounded-[2rem] p-8 relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                <h3 className="mb-6 text-slate-400 font-semibold uppercase tracking-wider text-xs">
                  Performance Progression
                </h3>

                <div className="flex-1 min-h-[300px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          dataKey="attempt"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ stroke: 'rgba(52,211,153,0.3)', strokeWidth: 1, strokeDasharray: '5 5' }}
                          contentStyle={{
                            backgroundColor: '#0d121f',
                            borderRadius: '1rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#ffffff',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
                          }}
                          itemStyle={{ color: '#34d399' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#10b981"
                          strokeWidth={3.5}
                          dot={{ r: 5, fill: '#080c14', stroke: '#10b981', strokeWidth: 2.5 }}
                          activeDot={{ r: 8, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500 flex-col gap-3 py-12">
                      <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                        <FaChartBar className="text-2xl text-slate-500" />
                      </div>
                      <p className="text-sm">Complete your first assessment to visualize score progression.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </Layout>
  );
}

function ProgressRing({ percentage }) {
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="flex justify-center relative">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="rgba(255,255,255,0.06)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black neon-text-gradient drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          {percentage}%
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Readiness</span>
      </div>
    </div>
  );
}
