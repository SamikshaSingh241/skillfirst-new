import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <motion.div
        className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  );
}