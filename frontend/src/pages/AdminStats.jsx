import { useEffect, useState } from "react";
import { api, authHeaders } from "../api/api";

export default function AdminStats() {

  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  async function loadStats() {
    try {

      const res = await api.get("/api/projects/stats/platform", {
        headers: authHeaders()
      });

      setStats(res.data);

    } catch (err) {
      setError("Failed to load platform statistics");
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats) return <p>Loading stats...</p>;

  return (
    <div style={{ padding: 20 }}>

      <h1>Platform Statistics</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 20 }}>

        <p><b>Total Projects:</b> {stats.totalProjects}</p>

        <p><b>Total Project Value:</b> ${stats.totalBudget}</p>

        <p><b>Platform Revenue:</b> ${stats.totalPlatformRevenue}</p>

        <p><b>Average Project Value:</b> ${stats.averageProjectValue}</p>

      </div>

    </div>
  );
}