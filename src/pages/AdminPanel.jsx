import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import { FaCheckCircle, FaTrash, FaUserShield, FaTimesCircle } from "react-icons/fa";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const { users } = useContext(AuthContext);
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
        className="space-y-8 text-slate-100"
      >
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <FaUserShield className="text-emerald-400" /> System Admin
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage users, verification badges, and platform health.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={totalUsers} color="from-cyan-500 to-blue-500" iconColor="text-cyan-400" />
          <StatCard title="Verified Profiles" value={verified} color="from-emerald-500 to-teal-500" iconColor="text-emerald-400" />
          <StatCard title="Avg Skill Score" value={`${avgScore.toFixed(1)}%`} color="from-teal-400 to-emerald-500" iconColor="text-teal-400" />
        </div>

        {/* User Management */}
        <div className="neon-card rounded-[2rem] p-8 relative overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_25px_rgba(16,185,129,0.06)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Platform Users</h3>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">
              {localUsers.length} Registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 font-semibold pl-4">Name</th>
                  <th className="pb-4 font-semibold">Role</th>
                  <th className="pb-4 font-semibold hidden md:table-cell">Score</th>
                  <th className="pb-4 font-semibold hidden sm:table-cell">Status</th>
                  <th className="pb-4 font-semibold text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {localUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase">
                          {u.name.substring(0, 2)}
                        </div>
                        <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="capitalize text-slate-300 text-xs bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      {u.role === "candidate" ? (
                        <span className="font-bold text-emerald-400">{u.skillScore}%</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-4 hidden sm:table-cell">
                      {u.verified ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          <FaCheckCircle /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-900 border border-white/10 px-2.5 py-1 rounded-full">
                          <FaTimesCircle /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleVerify(u.id)}
                          className={`p-2 rounded-xl border transition-all text-xs font-bold ${
                            u.verified
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                              : "border-white/10 text-slate-400 bg-slate-900 hover:text-white"
                          }`}
                          title="Toggle Verification"
                        >
                          {u.verified ? "Revoke" : "Verify"}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-2 rounded-xl border border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all text-xs"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="neon-card rounded-2xl p-6 relative overflow-hidden border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.06)]">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`} />
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{title}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
}