import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaComments, FaLightbulb, FaThumbsUp, FaMicrophone, FaStopCircle, FaPaperPlane } from "react-icons/fa";

export default function InterviewPrep({ questions }) {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [feedbackData, setFeedbackData] = useState({});
  const recognitionRef = useRef(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaComments className="text-3xl text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No Interview Questions Yet</h2>
        <p className="text-slate-500">
          Upload your resume or enter your skills on the overview tab to generate personalized interview questions!
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
        alert("Your browser does not support the Web Speech API. Please use Chrome.");
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
      alert("Please record an answer first.");
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
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3 text-slate-900 dark:text-white">
          Interview <span className="neon-text-gradient bg-gradient-to-r from-emerald-400 to-teal-500">Practice</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Rehearse these open-ended technical and behavioral questions out loud. Click the microphone to record and get AI HR feedback!
        </p>
      </div>

      <div className="grid gap-6">
        {questions.map((q, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="neon-card rounded-[2rem] p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-400 to-teal-500" />
            
            <div className="flex gap-4 items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                Q{index + 1}
              </div>
              <div className="w-full">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 leading-relaxed">
                  {q}
                </h3>
                
                {/* Recording UI */}
                <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-4 border border-slate-200 dark:border-white/5 mb-4">
                  <div className="flex items-center gap-4 mb-2">
                    <button 
                      onClick={() => toggleRecording(index)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        isRecording && activeQuestion === index 
                          ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 animate-pulse" 
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-200"
                      }`}
                    >
                      {isRecording && activeQuestion === index ? <FaStopCircle /> : <FaMicrophone />}
                      {isRecording && activeQuestion === index ? "Stop Recording" : "Record Answer"}
                    </button>
                    
                    {(activeQuestion === index && transcript) && (
                       <button 
                        onClick={() => submitAnswer(index, q)}
                        disabled={evaluating}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-200 disabled:opacity-50"
                       >
                         {evaluating && activeQuestion === index ? "Analyzing..." : "Submit to AI"} <FaPaperPlane />
                       </button>
                    )}
                  </div>
                  
                  {activeQuestion === index && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Live Transcript</p>
                      <div className="w-full min-h-[80px] p-3 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-[#050f05] rounded-lg border border-slate-200 dark:border-white/10">
                        {transcript || "Speak to start transcribing..."}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Feedback Section */}
                <AnimatePresence>
                  {feedbackData[index] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 p-5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                          <FaComments /> AI HR Evaluation
                        </h4>
                        <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
                          {feedbackData[index].score}/100
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 italic">
                        "{feedbackData[index].feedback}"
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Strengths</p>
                          <ul className="list-disc pl-4 text-sm text-slate-600 dark:text-slate-400">
                            {feedbackData[index].strengths?.map((str, i) => <li key={i}>{str}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-rose-500 uppercase mb-2">Areas for Improvement</p>
                          <ul className="list-disc pl-4 text-sm text-slate-600 dark:text-slate-400">
                            {feedbackData[index].improvements?.map((imp, i) => <li key={i}>{imp}</li>)}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/10 flex gap-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <FaLightbulb className="text-amber-400" /> Tip: Structure using STAR format
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
