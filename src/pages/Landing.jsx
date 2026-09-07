import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaCodeBranch, FaEye, FaArrowRight } from "react-icons/fa";

export default function Landing() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-[#080c14] text-slate-100">

      {/* Futuristic Subtle AI Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-600/10 blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/10 blur-[160px] -z-10 pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-teal-500/5 blur-[180px] -z-10 pointer-events-none" />

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex justify-between items-center py-6 px-10 md:px-24 relative z-20 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl"
      >
        <div className="text-3xl font-black tracking-tighter cursor-pointer flex items-center gap-2" onClick={() => navigate("/")}>
          <span className="neon-text-gradient">SkillFirst</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/login")}
            className="text-slate-300 font-semibold hover:text-emerald-400 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="btn-revolve px-5 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            Get Started
          </button>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10 pt-20 pb-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="inline-block mb-6 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-400 font-medium text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            ✨ Next Generation AI-Powered Hiring & Skill Assessment
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-white"
          >
            Hire the <span className="text-revolve-dark font-black">proven</span> talent, <br className="hidden md:block" /> not just the paper track.
          </motion.h1>

          <motion.p variants={itemVariants} className="max-w-2xl text-lg md:text-xl text-slate-300 mb-10 leading-relaxed font-normal">
            An intelligent platform combining automated resume scanning, tailored role-based assessments, and AI-driven speech interview practice to make hiring transparent, verifiable, and skill-driven.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center w-full max-w-md cursor-pointer">
            <button
              onClick={() => navigate("/register")}
              className="group relative flex items-center justify-center gap-2 btn-revolve text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all w-full shadow-[0_4px_25px_rgba(16,185,129,0.35)]"
            >
              Get Started
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-full font-bold text-slate-200 hover:text-white border border-white/10 hover:border-emerald-500/40 bg-slate-900/60 backdrop-blur-md hover:bg-slate-900/90 transition-all w-full shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            >
              Sign In
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 py-32 border-t border-white/5 relative z-10 bg-slate-950/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4 tracking-tight text-white">Why Choose SkillFirst?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">We bridge the gap between claimed skills and verified execution.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaShieldAlt className="text-3xl text-emerald-400" />}
              title="Verified Credentials"
              desc="Every certificate and document goes through rigorous validation before recruiters even see a profile. Trust, built-in."
              delay={0.1}
            />
            <FeatureCard
              icon={<FaCodeBranch className="text-3xl text-teal-400" />}
              title="AI Skill Assessment"
              desc="Dynamic scenario-based MCQs calibrated to your specific target role and resume, testing genuine practical aptitude."
              delay={0.3}
            />
            <FeatureCard
              icon={<FaEye className="text-3xl text-cyan-400" />}
              title="Transparent Hiring"
              desc="Recruiters get crystal clear visibility into verified skill scores and candidate performance metrics before shortlisting."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="px-6 py-24 relative overflow-hidden border-t border-b border-white/5 bg-slate-950/40">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <Stat number="98%" label="Fraud Reduction" delay={0.2} />
          <Stat number="3x" label="Faster Hiring Time" delay={0.4} />
          <Stat number="100%" label="Skill Transparency" delay={0.6} />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="text-center py-32 px-6 relative z-10">
        <div className="max-w-3xl mx-auto neon-card p-12 md:p-16 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(16,185,129,0.1)]">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Ready to hire smarter?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Take your first assessment, practice spoken interview questions with AI feedback, and stand out based on pure merit.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="btn-revolve text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            Join SkillFirst Today
          </button>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: delay }}
      className="neon-card rounded-[2rem] p-10 hover:-translate-y-1 transition-transform"
    >
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">
        {title}
      </h3>
      <p className="text-slate-400 font-normal leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}

function Stat({ number, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <h3 className="text-6xl font-black mb-3 text-revolve-dark inline-block drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
        {number}
      </h3>
      <p className="text-slate-400 font-medium text-lg mt-2">
        {label}
      </p>
    </motion.div>
  );
}