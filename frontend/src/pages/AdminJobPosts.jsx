import { useEffect, useState } from "react";
import { api, authHeaders } from "../api/api";

export default function AdminJobPosts() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({}); // jobId -> applications array
  const [error, setError] = useState("");

  async function loadJobs() {
    try {
      setError("");
      const res = await api.get("/api/jobs/admin", { headers: authHeaders() });
      setJobs(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load job posts");
    }
  }

  async function loadApplications(jobId) {
    try {
      setError("");
      const res = await api.get(`/api/applications/job/${jobId}`, {
        headers: authHeaders(),
      });

      setApplications((prev) => ({
        ...prev,
        [jobId]: res.data,
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load applications");
    }
  }
  async function selectApplication(applicationId) {
    try {
      setError("");
      await api.post(
        `/api/projects/from-application/${applicationId}`,
        {},
        { headers: authHeaders() }
      );

      alert("✅ Project created! Professional selected.");

    } catch (err) {
      setError(err?.response?.data?.message || "Failed to select application");
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Job Posts</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {jobs.length === 0 ? (
        <p>No job posts yet</p>
      ) : (
        jobs.map((job) => (
          <div
            key={job._id}
            style={{ border: "1px solid #ddd", padding: 12, marginBottom: 16 }}
          >
            <b>{job.requestId?.title || "Untitled job"}</b> — {job.status}

            <div style={{ marginTop: 8 }}>
              <button onClick={() => loadApplications(job._id)}>
                View Applications
              </button>
            </div>

            {applications[job._id] && (
              <div style={{ marginTop: 10 }}>
                {applications[job._id].length === 0 ? (
                  <p>No applications yet</p>
                ) : (
                  applications[job._id].map((app) => (
                    <div
                      key={app._id}
                      style={{
                        marginTop: 8,
                        padding: 10,
                        background: "#f7f7f7",
                      }}
                    >
                      <b>{app.professionalId?.name}</b> ({app.professionalId?.email})
                      <div>Status: {app.status}</div>
                      <div style={{ marginTop: 6 }}>{app.coverLetter}</div>
                      <button
                        style={{ marginTop: 8 }}
                        onClick={() => selectApplication(app._id)}
                      >
                        Select this professional
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}