import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaComments, FaLightbulb, FaMicrophone, FaStopCircle, FaPaperPlane } from "react-icons/fa";

export default function InterviewPrep({ questions }) {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [feedbackData, setFeedbackData] = useState({});
  const recognitionRef = useRef(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <div className="w-20 h-20 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(16,185,129,0.1)]">
          <FaComments className="text-3xl text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">No Interview Questions Generated Yet</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Upload your resume or specify your skills on the Overview tab to generate custom role-tailored interview practice questions!
        </p>
      </div>
    );
  }

  const toggleRecording = (index) => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      setActiveQuestion(index);
      setTranscript("");
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Your browser does not support the Web Speech API. Please use a browser such as Google Chrome or Microsoft Edge.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  const submitAnswer = async (index, questionText) => {
    if (!transcript.trim()) {
      alert("Please record your spoken answer before submitting.");
      return;
    }

    setEvaluating(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/ai/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText, answer: transcript }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setFeedbackData(prev => ({ ...prev, [index]: data }));
      } else {
        alert(data.error || "Failed to evaluate answer");
      }
    } catch (err) {
      console.error(err);
      alert("Error communicating with backend.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 text-slate-100">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3 text-white">
          AI Speech <span className="neon-text-gradient">Interview Practice</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Rehearse these open-ended technical and behavioral questions out loud. Record your voice and receive instant HR-style AI analysis and scoring!
        </p>
      </div>

      <div className="grid gap-6">
        {questions.map((q, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="neon-card rounded-[2rem] p-8 relative overflow-hidden border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.06)] group"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-cyan-500" />
            
            <div className="flex gap-4 items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                Q{index + 1}
              </div>
              <div className="w-full">
                <h3 className="text-lg md:text-xl font-bold text-white mb-5 leading-relaxed">
                  {q}
                </h3>
                
                {/* Voice Recording Control */}
                <div className="bg-slate-900/70 rounded-2xl p-5 border border-white/10 mb-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                  <div className="flex flex-wrap items-center gap-4 mb-2">
                    <button 
                      onClick={() => toggleRecording(index)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                        isRecording && activeQuestion === index 
                          ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
                          : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      }`}
                    >
                      {isRecording && activeQuestion === index ? <FaStopCircle /> : <FaMicrophone />}
                      {isRecording && activeQuestion === index ? "Stop Speaking" : "Start Spoken Answer"}
                    </button>
                    
                    {(activeQuestion === index && transcript) && (
                       <button 
                        onClick={() => submitAnswer(index, q)}
                        disabled={evaluating}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                       >
                         {evaluating ? "Evaluating Speech..." : "Submit to AI HR"} <FaPaperPlane />
                       </button>
                    )}
                  </div>
                  
                  {activeQuestion === index && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Live Speech Transcript</p>
                      <div className="w-full min-h-[90px] p-3.5 text-sm text-slate-200 bg-slate-950/80 rounded-xl border border-white/10 shadow-inner">
                        {transcript || <span className="text-slate-500 italic">Listening... Speak clearly into your microphone.</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI HR Evaluation Section */}
                <AnimatePresence>
                  {feedbackData[index] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.1)]"
                    >
                      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                        <h4 className="font-bold text-emerald-400 flex items-center gap-2 text-base">
                          <FaComments /> AI HR Evaluation & Feedback
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Score:</span>
                          <span className="font-black text-2xl text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                            {feedbackData[index].score}/100
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-5 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-white/5">
                        "{feedbackData[index].feedback}"
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl">
                          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Observed Strengths</p>
                          <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                            {feedbackData[index].strengths?.map((str, i) => <li key={i}>{str}</li>)}
                          </ul>
                        </div>
                        <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl">
                          <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Areas for Growth</p>
                          <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                            {feedbackData[index].improvements?.map((imp, i) => <li key={i}>{imp}</li>)}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="pt-4 mt-4 border-t border-white/5 flex gap-4 text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-2">
                    <FaLightbulb className="text-amber-400" /> Pro Tip: Structure behavioral responses with the STAR method (Situation, Task, Action, Result)
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
