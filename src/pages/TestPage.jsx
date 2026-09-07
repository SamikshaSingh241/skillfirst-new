import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function TestPage({ customQuestions }) {
  const { currentUser, updateUser } = useContext(AuthContext);

  const fallbackQuestions = [
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

  const activeQuestions = customQuestions && customQuestions.length > 0 ? customQuestions : fallbackQuestions;

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
        skillScore: Math.max(currentUser.skillScore || 0, percentage),
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
    <div className="w-full text-slate-100">
      <div className="max-w-3xl mx-auto py-8">

        {!submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black mb-2 text-white">
                Skill <span className="neon-text-gradient">Assessment</span>
              </h1>
              <p className="text-slate-400 text-sm">
                Scenario-based medium-to-hard questions calibrated strictly to your profile and target role.
              </p>
            </div>

            <div className="flex justify-between items-center text-sm font-semibold text-slate-400 mb-4 px-2">
              <span>Question {currentQuestionIndex + 1} of {activeQuestions.length}</span>
              <span className="text-emerald-400">{Math.round(((Object.keys(answers).length) / activeQuestions.length) * 100)}% Completed</span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2 mb-8 border border-white/10 overflow-hidden shadow-inner">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 h-2 rounded-full shadow-[0_0_12px_#10b981]"
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
                className="neon-card rounded-[2rem] p-8 md:p-10 relative overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(16,185,129,0.08)]"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

                <h2 className="text-xl md:text-2xl font-bold mb-8 text-white leading-relaxed">
                  {currentQuestion.question}
                </h2>

                <div className="space-y-4">
                  {currentQuestion.options.map((opt) => {
                    const selected = answers[currentQuestion.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelect(currentQuestion.id, opt)}
                        className={`w-full text-left px-6 py-4 rounded-xl border transition-all duration-300 font-medium flex items-center justify-between group ${
                          selected
                            ? "bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] scale-[1.01]"
                            : "bg-slate-900/60 border-white/10 text-slate-300 hover:border-emerald-500/40 hover:bg-slate-900/90"
                        }`}
                      >
                        <span className="text-sm md:text-base leading-snug">{opt}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ml-4 shrink-0 ${
                          selected ? "border-emerald-400" : "border-slate-600 group-hover:border-emerald-500/50"
                        }`}>
                          {selected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
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
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FaArrowLeft /> Previous
              </button>

              {!isLastQuestion ? (
                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-2 btn-revolve text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.35)]"
                >
                  Next <FaArrowRight />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isAllAnswered}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                    isAllAnswered
                      ? "btn-revolve text-white shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:scale-105"
                      : "bg-slate-900/80 text-slate-500 border border-white/10 cursor-not-allowed"
                  }`}
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
                className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto flex items-center justify-center mb-6 shadow-[0_0_35px_rgba(16,185,129,0.4)]"
              >
                <FaTrophy className="text-4xl text-slate-950" />
              </motion.div>
              <h1 className="text-4xl font-black mb-2 text-white">Assessment Complete</h1>
              <p className="text-slate-400 text-sm">Here is a comprehensive breakdown of your verified performance.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="neon-card rounded-[2rem] p-6 text-center border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.08)]">
                <p className="text-slate-400 font-bold uppercase tracking-wider mb-2 text-xs">Final Score</p>
                <p className="text-5xl font-black neon-text-gradient">{testResult.percentage}%</p>
              </div>
              <div className="neon-card rounded-[2rem] p-6 text-center border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.08)]">
                <p className="text-slate-400 font-bold uppercase tracking-wider mb-2 text-xs">Correct Answers</p>
                <p className="text-5xl font-black text-white">{testResult.score} / {activeQuestions.length}</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-6">Detailed Results</h3>
            <div className="space-y-4">
              {testResult.details.map((q, index) => (
                <div 
                  key={q.id || index} 
                  className="neon-card rounded-2xl p-6 border-l-4 border border-white/10" 
                  style={{ borderLeftColor: q.isCorrect ? '#10b981' : '#f43f5e' }}
                >
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <h4 className="text-base md:text-lg font-semibold text-white leading-relaxed">
                      <span className="text-slate-500 mr-2">{index + 1}.</span> {q.question}
                    </h4>
                    {q.isCorrect ? (
                      <FaCheckCircle className="text-emerald-400 text-xl shrink-0 mt-1" />
                    ) : (
                      <FaTimesCircle className="text-rose-400 text-xl shrink-0 mt-1" />
                    )}
                  </div>

                  <div className="space-y-2 mt-4 text-sm">
                    <div className="flex gap-2 items-center text-slate-300">
                      <span className="font-semibold w-28 text-slate-500 uppercase text-xs tracking-wider">Your Answer:</span>
                      <span className={q.isCorrect ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                        {q.selected || "None"}
                      </span>
                    </div>
                    {!q.isCorrect && (
                      <div className="flex gap-2 items-center text-slate-300">
                        <span className="font-semibold w-28 text-slate-500 uppercase text-xs tracking-wider">Correct:</span>
                        <span className="text-emerald-400 font-semibold">{q.answer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 rounded-xl font-bold text-white border border-white/15 bg-slate-900/80 hover:bg-white/10 hover:border-emerald-500/40 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
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