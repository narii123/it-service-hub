import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, authHeaders } from "../api/api";
import "../styles/dashboard.css";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  async function loadRequests() {
    try {
      setError("");
      const res = await api.get("/api/requests", { headers: authHeaders() });
      setRequests(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load requests");
    }
  }

  async function loadStats() {
    try {
      const res = await api.get("/api/projects/stats/platform", {
        headers: authHeaders(),
      });

      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(
        `/api/requests/${id}/status`,
        { status },
        { headers: authHeaders() }
      );
      loadRequests();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status");
    }
  }

  async function convertToJobPost(requestId) {
    try {
      setError("");
      await api.post(
        `/api/jobs/from-request/${requestId}`,
        {},
        { headers: authHeaders() }
      );
      loadRequests();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to convert request");
    }
  }

  useEffect(() => {
    loadRequests();
    loadStats();
  }, []);

  return (
    <div className="page">
      <div className="container">

        <h1>Admin Dashboard</h1>

        {stats && (
          <div style={{
            marginBottom: 20,
            padding: 15,
            border: "1px solid #ddd",
            background: "#f9f9f9"
          }}>
            <h3>Platform Earnings</h3>

            <div>Total Projects: {stats.totalProjects}</div>
            <div>Total Project Value: ${stats.totalBudget}</div>

            <div style={{ color: "green", fontWeight: "bold" }}>
              Platform Profit: ${stats.totalPlatformRevenue}
            </div>

            <div>Average Project Value: ${stats.averageProjectValue}</div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <Link to="/admin/jobs">
            <button>Go to Job Posts</button>
          </Link>

          <Link to="/admin/stats">
            <button>Platform Statistics</button>
          </Link>

          <Link to="/admin/projects">
            <button style={{ marginLeft: 10 }}>
              View Projects
            </button>
          </Link>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <h3>Service Requests</h3>

        {requests.length === 0 ? (
          <p>No requests yet</p>
        ) : (
          <ul>
            {requests.map((r) => (
              <li key={r._id} style={{ marginBottom: 14 }}>
                <b>{r.title}</b> — {r.status} — budget: {r.budget}

                <div style={{ fontSize: 12, color: "#555" }}>
                  client: {r.clientId?.email || r.clientId}
                </div>

                <div style={{ marginTop: 8 }}>
                  <select
                    defaultValue={r.status}
                    onChange={(e) => updateStatus(r._id, e.target.value)}
                  >
                    <option value="submitted">submitted</option>
                    <option value="under_review">under_review</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                    <option value="converted">converted</option>
                  </select>

                  {r.status !== "converted" && (
                    <button
                      style={{ marginLeft: 10 }}
                      onClick={() => convertToJobPost(r._id)}
                    >
                      Convert to Job Post
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
}