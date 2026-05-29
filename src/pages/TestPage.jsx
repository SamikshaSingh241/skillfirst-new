import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function TestPage({ customQuestions }) {
  const { currentUser, updateUser } = useContext(AuthContext);

  const questions = [
    {
      id: 1,
      question: "Which hook is used to manage state in a functional component?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      answer: "useState",
    },
    {
      id: 2,
      question: "What does CSS stand for?",
      options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
      answer: "Cascading Style Sheets",
    },
    {
      id: 3,
      question: "Which array method returns a new array with elements that pass a test?",
      options: ["map()", "reduce()", "filter()", "forEach()"],
      answer: "filter()",
    }
  ];

  // Use dynamically generated questions if available, otherwise fallback
  const activeQuestions = customQuestions && customQuestions.length > 0 ? customQuestions : questions;

  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const currentQuestion = activeQuestions[currentQuestionIndex];

  const handleSelect = (qId, option) => {
    if (submitted) return;
    setAnswers({ ...answers, [qId]: option });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    let score = 0;
    const details = activeQuestions.map((q) => {
      const isCorrect = answers[q.id] === q.answer;
      if (isCorrect) score++;
      return { ...q, selected: answers[q.id], isCorrect };
    });

    const percentage = Math.round((score / activeQuestions.length) * 100);

    if (currentUser && updateUser) {
      updateUser({
        ...currentUser,
        skillScore: Math.max(currentUser.skillScore || 0, percentage), // Keep best score
        scoreHistory: [
          ...(currentUser.scoreHistory || []),
          percentage,
        ],
      });
    }

    setTestResult({ score, percentage, details });
    setSubmitted(true);
  };

  const isLastQuestion = currentQuestionIndex === activeQuestions.length - 1;
  const isAllAnswered = Object.keys(answers).length === activeQuestions.length;

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto py-8">

        {!submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black mb-2 text-slate-900 dark:text-white">
                Skill <span className="neon-text-gradient">Assessment</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400">Answer all questions to determine your proficiency level.</p>
            </div>

            <div className="flex justify-between items-center text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4 px-2">
              <span>Question {currentQuestionIndex + 1} of {activeQuestions.length}</span>
              <span>{Math.round(((Object.keys(answers).length) / activeQuestions.length) * 100)}% Completed</span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-[#05050f] rounded-full h-2 mb-8 border border-slate-300 dark:border-white/10 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-fuchsia-500 to-violet-500 h-2 rounded-full"
                animate={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="neon-card rounded-[2rem] p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500" />

                <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">
                  {currentQuestion.question}
                </h2>

                <div className="space-y-4">
                  {currentQuestion.options.map((opt) => {
                    const selected = answers[currentQuestion.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelect(currentQuestion.id, opt)}
                        className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-300 font-medium flex items-center justify-between group
                          ${selected
                            ? "bg-violet-100 dark:bg-violet-500/10 border-violet-500 text-slate-900 dark:text-white shadow-sm dark:shadow-[0_0_15px_rgba(139,92,246,0.3)] scale-[1.02]"
                            : "bg-slate-50 dark:bg-[#0b0f19] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-500/5"
                          }
                        `}
                      >
                        <span>{opt}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                          ${selected ? "border-violet-500 dark:border-violet-400" : "border-slate-400 dark:border-slate-600 group-hover:border-violet-400/50"}
                        `}>
                          {selected && <div className="w-2.5 h-2.5 rounded-full bg-violet-500 dark:bg-violet-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center mt-8">
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-slate-600 dark:disabled:hover:text-slate-400"
              >
                <FaArrowLeft /> Previous
              </button>

              {!isLastQuestion ? (
                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-2 btn-revolve text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
                >
                  Next <FaArrowRight />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isAllAnswered}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all
                    ${isAllAnswered
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-[#05050f] shadow-lg dark:shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-105"
                      : "bg-slate-200 dark:bg-[#0b0f19] text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-white/10 cursor-not-allowed"
                    }
                  `}
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-24 h-24 rounded-full neon-bg-gradient mx-auto flex items-center justify-center mb-6 shadow-xl dark:shadow-[0_0_30px_rgba(217,70,239,0.5)]"
              >
                <FaTrophy className="text-4xl text-white dark:text-[#05050f]" />
              </motion.div>
              <h1 className="text-4xl font-black mb-2 text-slate-900 dark:text-white">Assessment Complete</h1>
              <p className="text-slate-600 dark:text-slate-400">Here is a detailed breakdown of your performance.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="neon-card rounded-[2rem] p-6 text-center">
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2 text-sm">Final Score</p>
                <p className="text-5xl font-black neon-text-gradient">{testResult.percentage}%</p>
              </div>
              <div className="neon-card rounded-[2rem] p-6 text-center">
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2 text-sm">Correct Answers</p>
                <p className="text-5xl font-black text-slate-900 dark:text-white">{testResult.score} / {activeQuestions.length}</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Detailed Results</h3>
            <div className="space-y-4">
              {testResult.details.map((q, index) => (
                <div key={q.id} className="neon-card rounded-2xl p-6 border-l-4" style={{ borderLeftColor: q.isCorrect ? '#10b981' : '#f43f5e' }}>
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                      <span className="text-slate-400 dark:text-slate-500 mr-2">{index + 1}.</span> {q.question}
                    </h4>
                    {q.isCorrect ? (
                      <FaCheckCircle className="text-emerald-500 text-xl flex-shrink-0" />
                    ) : (
                      <FaTimesCircle className="text-rose-500 text-xl flex-shrink-0" />
                    )}
                  </div>

                  <div className="space-y-2 mt-4 text-sm">
                    <div className="flex gap-2 items-center text-slate-600 dark:text-slate-300">
                      <span className="font-semibold w-24 text-slate-400 dark:text-slate-500 uppercase text-xs tracking-wider">Your Answer:</span>
                      <span className={q.isCorrect ? "text-emerald-500 dark:text-emerald-400 font-semibold" : "text-rose-500 dark:text-rose-400 font-semibold"}>
                        {q.selected || "None"}
                      </span>
                    </div>
                    {!q.isCorrect && (
                      <div className="flex gap-2 items-center text-slate-600 dark:text-slate-300">
                        <span className="font-semibold w-24 text-slate-400 dark:text-slate-500 uppercase text-xs tracking-wider">Correct:</span>
                        <span className="text-emerald-500 dark:text-emerald-400 font-semibold">{q.answer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 rounded-xl font-bold text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Retake Assessment
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}