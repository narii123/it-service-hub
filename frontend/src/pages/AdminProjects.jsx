import { useEffect, useState } from "react";
import { api, authHeaders } from "../api/api";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  async function loadProjects() {
    try {
      const res = await api.get("/api/projects", {
        headers: authHeaders(),
      });
      setProjects(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load projects");
    }
  }

  async function reviewProject(projectId, decision) {
    try {
      await api.patch(
        `/api/projects/${projectId}/deliverables/review`,
        { decision },
        { headers: authHeaders() }
      );

      alert("Review submitted");
      loadProjects();
    } catch (err) {
      setError(err?.response?.data?.message || "Review failed");
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Projects</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {projects.length === 0 ? (
        <p>No projects yet</p>
      ) : (
        projects.map((p) => {
          const latest =
            p.deliverables && p.deliverables.length > 0
              ? p.deliverables[p.deliverables.length - 1]
              : null;

          return (
            <div
              key={p._id}
              style={{
                border: "1px solid #ddd",
                padding: 15,
                marginBottom: 20,
              }}
            >
              <h3>{p.jobPostId?.title}</h3>
              <div>Status: {p.status}</div>

              {latest ? (
                <div style={{ marginTop: 10 }}>
                  <div>
                    Deliverable:{" "}
                    <a href={latest.content} target="_blank">
                      {latest.content}
                    </a>
                  </div>
                  <div>Admin Decision: {latest.adminDecision}</div>

                  {p.status === "submitted" && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        onClick={() =>
                          reviewProject(p._id, "approved")
                        }
                      >
                        Approve
                      </button>

                      <button
                        style={{ marginLeft: 10 }}
                        onClick={() =>
                          reviewProject(p._id, "changes_requested")
                        }
                      >
                        Request Changes
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p>No deliverables yet</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}