import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import { FaCheckCircle, FaTrash, FaUserShield, FaTimesCircle } from "react-icons/fa";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const { users, setUsers } = useContext(AuthContext); // Assuming setUsers is available or we mock state locally
  // Since setUsers might not be in AuthContext from the original code, we will maintain local state for demo purposes
  const [localUsers, setLocalUsers] = useState(users);

  const totalUsers = localUsers.length;
  const candidates = localUsers.filter((u) => u.role === "candidate");
  const verified = candidates.filter((c) => c.verified).length;

  const avgScore = candidates.length > 0
    ? candidates.reduce((acc, c) => acc + (c.skillScore || 0), 0) / candidates.length
    : 0;

  const toggleVerify = (id) => {
    setLocalUsers(localUsers.map(user =>
      user.id === id ? { ...user, verified: !user.verified } : user
    ));
  };

  const deleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setLocalUsers(localUsers.filter(user => user.id !== id));
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 text-slate-900 dark:text-slate-100"
      >
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <FaUserShield className="text-fuchsia-600 dark:text-fuchsia-500" /> System Admin
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Manage users, verification status, and platform health.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={totalUsers} color="from-blue-500 to-indigo-500" iconColor="text-blue-600 dark:text-blue-400" />
          <StatCard title="Verified Profiles" value={verified} color="from-emerald-500 to-teal-500" iconColor="text-emerald-600 dark:text-emerald-400" />
          <StatCard title="Avg Skill Score" value={`${avgScore.toFixed(1)}%`} color="from-fuchsia-500 to-pink-500" iconColor="text-fuchsia-600 dark:text-fuchsia-400" />
        </div>

        {/* User Management */}
        <div className="neon-card rounded-[2rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Platform Users</h3>
            <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold">
              {localUsers.length} Registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                  <th className="pb-4 font-semibold pl-4">Name</th>
                  <th className="pb-4 font-semibold">Role</th>
                  <th className="pb-4 font-semibold hidden md:table-cell">Score</th>
                  <th className="pb-4 font-semibold hidden sm:table-cell">Status</th>
                  <th className="pb-4 font-semibold text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {localUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs uppercase">
                          {u.name.substring(0, 2)}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="capitalize text-slate-700 dark:text-slate-300 text-sm bg-slate-200 dark:bg-white/5 px-2 py-1 rounded text-center">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      {u.role === "candidate" ? (
                        <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400">{u.skillScore}%</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-4 hidden sm:table-cell">
                      {u.role === "candidate" ? (
                        u.verified ? (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-xs font-bold bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-1 rounded-full w-max">
                            <FaCheckCircle /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 text-xs font-bold bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-1 rounded-full w-max">
                            <FaTimesCircle /> Pending
                          </span>
                        )
                      ) : (
                        <span className="text-slate-500 dark:text-slate-500 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="py-4 pr-4 border-l border-slate-100 dark:border-white/5 text-right">
                      <div className="flex items-center justify-end gap-2 isolate">
                        {u.role === "candidate" && (
                          <button
                            onClick={() => toggleVerify(u.id)}
                            className={`p-2 rounded-lg transition-colors ${u.verified ? "text-slate-400 hover:text-amber-500 hover:bg-amber-100 dark:hover:text-amber-400 dark:hover:bg-amber-500/10" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10"}`}
                            title={u.verified ? "Revoke Verification" : "Verify User"}
                          >
                            {u.verified ? <FaTimesCircle /> : <FaCheckCircle />}
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {localUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500 italic">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}

function StatCard({ title, value, color, iconColor }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="neon-card rounded-2xl p-6 relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`} />
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">{title}</h3>
      <p className={`text-4xl font-black ${iconColor} drop-shadow-[0_0_10px_currentColor] opacity-90`}>
        {value}
      </p>
    </motion.div>
  );
}