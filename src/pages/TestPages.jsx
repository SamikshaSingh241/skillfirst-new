import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function TestPage() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [score, setScore] = useState(null);

  const handleSubmit = () => {
    const newScore = 90; // mock
    setScore(newScore);
    updateUser({ ...currentUser, skillScore: newScore });
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Skill Test</h2>

      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Submit Test
      </button>

      {score && <p className="mt-4">New Score: {score}%</p>}
    </Layout>
  );
}