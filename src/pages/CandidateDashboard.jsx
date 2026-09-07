import { useContext, useState } from "react";
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
import { FaUpload, FaFileAlt, FaEdit, FaSave, FaChartBar, FaGraduationCap, FaComments } from "react-icons/fa";
import TestPage from "./TestPage";
import InterviewPrep from "../components/InterviewPrep";

export default function CandidateDashboard() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [experience, setExperience] = useState(currentUser?.experience || "");
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  
  // Manual Entry States
  const [manualMode, setManualMode] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState("");

  const chartData =
    currentUser?.scoreHistory?.map((score, index) => ({
      attempt: index + 1,
      score,
    })) || [];

  const handleSaveProfile = () => {
    updateUser({
      ...currentUser,
      experience,
    });
    setEditing(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadedDocs([...uploadedDocs, file.name]);
    setIsAnalyzing(true);
    
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetRole", targetRole);

    try {
      const response = await fetch("http://localhost:5000/api/ai/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setAssessmentData(data); // Save entire data object containing both array types
        // Automatically switch to assessment tab so they can take their generated test
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

  const handleManualGenerate = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim() || !skills.trim()) return;

    setIsAnalyzing(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/ai/generate-from-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, skills }),
      });

      const data = await response.json();
      if (response.ok) {
        setAssessmentData(data); // Save entire data object
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
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Student Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Track your progress and profile completion</p>
          </div>

          <div className="flex bg-white dark:bg-[#0b0f19] p-1 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "overview"
                ? "bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("assessment")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "assessment"
                ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              <FaGraduationCap /> Assessment
            </button>
            <button
              onClick={() => setActiveTab("interview")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "interview"
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              <FaComments /> Interview Prep
            </button>
          </div>
        </div>

        {activeTab === "assessment" ? (
          <div className="mt-8">
            <TestPage customQuestions={assessmentData?.questions} />
          </div>
        ) : activeTab === "interview" ? (
          <div className="mt-8">
            <InterviewPrep questions={assessmentData?.interviewQuestions} />
          </div>
        ) : (
          <>
            {/* Top Grid */}
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              {/* Progress Ring */}
              <motion.div
                whileHover={{ y: -4 }}
                className="neon-card rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
                <h3 className="mb-8 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                  Skill Score
                </h3>
                <ProgressRing percentage={currentUser?.skillScore || 0} />
              </motion.div>

              {/* Profile Editor */}
              <motion.div
                whileHover={{ y: -4 }}
                className="neon-card rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-center"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-sm">
                    Professional Profile
                  </h3>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-white p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
                    >
                      <FaEdit className="text-xl" />
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
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Experience Level</label>
                        <input
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#05050f] border border-slate-300 dark:border-white/10 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-3 px-4 outline-none transition-all text-slate-900 dark:text-white font-medium shadow-inner"
                          placeholder="e.g., 2 Years - Frontend Dev"
                        />
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center justify-center gap-2 w-full btn-revolve text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-md dark:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
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
                      <p className="text-slate-500 text-sm mb-1">Current Experience</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {currentUser?.experience || "Not Set"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-8">
              {/* Document Upload */}
              <motion.div
                whileHover={{ y: -4 }}
                className="md:col-span-1 neon-card rounded-[2rem] p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-sm">
                    {manualMode ? "Manual Entry" : "Documents"}
                  </h3>
                  <button
                    onClick={() => setManualMode(!manualMode)}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full transition-colors"
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
                      className="space-y-4 mb-6"
                    >
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Target Job Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Senior React Developer"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Key Skills & Experience</label>
                        <textarea
                          required
                          rows="3"
                          placeholder="e.g., 5 years of experience with React, Redux, Node.js. Built scalable microservices..."
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isAnalyzing}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            AI is creating test...
                          </>
                        ) : (
                          "Generate Assessment"
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Target Role (Required)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Frontend Developer"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white mb-2"
                          />
                        </div>
                        <div className="relative border-2 border-dashed border-emerald-300 dark:border-emerald-500/30 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 p-6 text-center hover:bg-emerald-100 dark:hover:bg-emerald-500/10 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-colors cursor-pointer group">
                          <input
                            type="file"
                            onChange={(e) => {
                                if(!targetRole.trim()) {
                                    alert("Please enter a Target Role before uploading your resume.");
                                    e.target.value = "";
                                    return;
                                }
                                handleUpload(e);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isAnalyzing}
                          />
                          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:scale-110 transition-transform">
                            {isAnalyzing ? (
                              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FaUpload />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                            {isAnalyzing ? "AI is reading..." : "Click to upload"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">PDF Resume (AI Analyzed)</p>
                        </div>
                      </div>

                      {uploadedDocs.length > 0 && (
                        <ul className="space-y-3">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Uploaded</p>
                          {uploadedDocs.map((doc, index) => (
                            <motion.li
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={index}
                              className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10"
                            >
                              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <FaFileAlt />
                              </div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{doc}</span>
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
                whileHover={{ y: -4 }}
                className="md:col-span-2 neon-card rounded-[2rem] p-8 relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                <h3 className="mb-6 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-sm">
                  Performance Trend
                </h3>

                <div className="flex-1 min-h-[300px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" className="dark:stroke-[#1e293b]" />
                        <XAxis
                          dataKey="attempt"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', color: '#0f172a' }}
                          itemStyle={{ color: '#0f172a' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#10b981"
                          strokeWidth={4}
                          dot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                          activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500 flex-col gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800/50 flex items-center justify-center">
                        <FaChartBar className="text-2xl opacity-50 text-slate-600 dark:text-slate-400" />
                      </div>
                      <p>No attempts registered yet.</p>
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
          stroke="#e2e8f0"
          className="dark:stroke-[#1e293b]"
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
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black neon-text-gradient">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
