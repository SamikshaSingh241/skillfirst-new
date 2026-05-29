import { motion } from "framer-motion";
import { FaComments, FaLightbulb, FaThumbsUp } from "react-icons/fa";

export default function InterviewPrep({ questions }) {
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

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3 text-slate-900 dark:text-white">
          Interview <span className="neon-text-gradient bg-gradient-to-r from-emerald-400 to-teal-500">Practice</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Rehearse these open-ended technical and behavioral questions out loud.
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
            
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                Q{index + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 leading-relaxed">
                  {q}
                </h3>
                
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex gap-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <FaLightbulb className="text-amber-400" /> Tip: Structure using STAR format
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <button className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                      <FaThumbsUp /> Mark as rehearsed
                    </button>
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
