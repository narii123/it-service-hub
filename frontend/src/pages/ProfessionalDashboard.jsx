import { useEffect, useState } from "react";
import { api, authHeaders } from "../api/api";
import "../styles/dashboard.css";

export default function ProfessionalDashboard() {
  const [jobs, setJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [coverLetters, setCoverLetters] = useState({});

  async function loadJobs() {
    try {
      const res = await api.get("/api/jobs", { headers: authHeaders() });
      setJobs(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load jobs");
    }
  }

  async function loadMyProjects() {
    try {
      const res = await api.get("/api/projects/me", { headers: authHeaders() });
      setProjects(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load projects");
    }
  }

  async function apply(jobPostId) {
    try {
      setError("");
      setMessage("");

      const coverLetter = coverLetters[jobPostId] || "";

      await api.post(
        "/api/applications",
        { jobPostId, coverLetter },
        { headers: authHeaders() }
      );

      setMessage("✅ Applied successfully!");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to apply");
    }
  }

  useEffect(() => {
    loadJobs();
    loadMyProjects();
  }, []);

  return (
  <div className="page">
    <div className="container">

      <h1>Professional Dashboard</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}


      <h3>My Projects</h3>
      {projects.length === 0 ? (
        <p>No assigned projects yet</p>
      ) : (
        <ul>
          {projects.map((p) => (
            <li key={p._id} style={{ marginBottom: 15 }}>
              <b>{p.jobPostId?.title}</b> — status: {p.status}

              {p.status !== "completed" && (
                <div style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    placeholder="Paste deliverable link..."
                    style={{ width: 350 }}
                    onChange={(e) =>
                      setCoverLetters((prev) => ({
                        ...prev,
                        ["deliverable_" + p._id]: e.target.value,
                      }))
                    }
                  />

                  <button
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                      try {
                        await api.post(
                          `/api/projects/${p._id}/deliverables`,
                          {
                            type: "link",
                            content: coverLetters["deliverable_" + p._id],
                            note: "Final submission",
                          },
                          { headers: authHeaders() }
                        );

                        alert("Deliverable submitted!");
                        loadMyProjects();
                      } catch (err) {
                        setError(err?.response?.data?.message || "Submit failed");
                      }
                    }}
                >
                    Submit Deliverable
                </button>
              </div>
            )}
          </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h3>Open Jobs</h3>
      {jobs.length === 0 ? (
        <p>No open jobs yet</p>
      ) : (
        <ul>
          {jobs.map((j) => (
            <li key={j._id} style={{ marginBottom: 18 }}>
              <b>{j.requestId?.title}</b> — status: {j.status}
              <div style={{ fontSize: 12, color: "#555" }}>
                Skills: {j.requestId?.requiredSkills?.join(", ")}
              </div>

              <div style={{ marginTop: 8 }}>
                <textarea
                  rows={3}
                  placeholder="Write a short cover letter..."
                  value={coverLetters[j._id] || ""}
                  onChange={(e) =>
                    setCoverLetters((prev) => ({
                      ...prev,
                      [j._id]: e.target.value,
                    }))
                  }
                  style={{ width: 420 }}
                />
              </div>

              <button style={{ marginTop: 6 }} onClick={() => apply(j._id)}>
                Apply
              </button>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}