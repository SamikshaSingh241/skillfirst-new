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
    <div className="min-h-screen flex flex-col overflow-hidden relative">

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-600/20 dark:bg-fuchsia-600/10 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 dark:bg-violet-600/10 blur-[150px] -z-10 pointer-events-none" />

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex justify-between items-center py-6 px-10 md:px-24 relative z-20"
      >
        <div className="text-3xl font-black text-black tracking-tighter">
          SkillFirst
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/login")}
            className="text-black font-semibold hover:text-[#CBC3E3] transition-colors"
          >
            Sign In
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
          <motion.div variants={itemVariants} className="inline-block mb-6 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-100 backdrop-blur-sm text-violet-700 font-medium text-sm shadow-sm">
            ✨ Next Generation Tech Hiring
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-black"
          >
            Hire the <span className="text-revolve-dark font-black">proven</span> talent, <br className="hidden md:block" /> not just the paper track.
          </motion.h1>

          <motion.p variants={itemVariants} className="max-w-2xl text-lg md:text-xl text-black mb-10 leading-relaxed font-medium">
            A secure platform combining rigorous document verification with real-world skill assessment. Making hiring transparent, reliable, and completely skill-driven.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center w-full max-w-md cursor-pointer">
            <button
              onClick={() => navigate("/login")}
              className="group relative flex items-center justify-center gap-2 btn-revolve text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all w-full shadow-md"
            >
              Get Started
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn-revolve text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all w-full shadow-md"
            >
              View Demo
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 py-32 border-t border-slate-200 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4 tracking-tight text-black">Why Choose SkillFirst?</h2>
            <p className="text-black max-w-2xl mx-auto text-lg">We bridge the gap between claimed skills and actual ability.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaShieldAlt className="text-3xl text-fuchsia-500 dark:text-fuchsia-400" />}
              title="Verified Credentials"
              desc="Every certificate and document goes through rigorous validation before recruiters even see a profile. Trust, built-in."
              delay={0.1}
            />
            <FeatureCard
              icon={<FaCodeBranch className="text-3xl text-violet-500 dark:text-violet-400" />}
              title="Skill-Based Testing"
              desc="Integrated technical and aptitude testing environments ensuring candidates can actually do what they say they can."
              delay={0.3}
            />
            <FeatureCard
              icon={<FaEye className="text-3xl text-blue-500 dark:text-blue-400" />}
              title="Transparent Hiring"
              desc="Recruiters get crystal clear visibility into skill scores and verification badges before ever making a shortlist."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="px-6 py-24 relative overflow-hidden border-t border-b border-slate-200">
        <div className="absolute inset-0 bg-slate-100 -z-20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50 -z-10" />

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center text-black">
          <Stat number="98%" label="Fraud Reduction" delay={0.2} />
          <Stat number="3x" label="Faster Hiring Time" delay={0.4} />
          <Stat number="100%" label="Skill Transparency" delay={0.6} />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="text-center py-32 px-6 relative z-10">
        <h2 className="text-5xl font-bold tracking-tight text-black mb-8">
          Ready to hire smarter?
        </h2>
        <button
          onClick={() => navigate("/login")}
          className="btn-revolve text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg"
        >
          Join SkillFirst Today
        </button>
      </section>

    </div >
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: delay }}
      className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-100"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 border border-slate-200 shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-black tracking-tight">
        {title}
      </h3>
      <p className="text-black font-medium leading-relaxed">
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
      <h3 className="text-6xl font-black mb-3 text-revolve-dark inline-block">
        {number}
      </h3>
      <p className="text-black font-semibold text-lg mt-2">
        {label}
      </p>
    </motion.div>
  );
}