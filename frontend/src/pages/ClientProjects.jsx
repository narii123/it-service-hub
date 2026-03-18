import { useEffect, useState } from "react";
import { api, authHeaders } from "../api/api";

export default function ClientProjects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  async function loadProjects() {
    try {
      const res = await api.get("/api/projects/my", {
        headers: authHeaders(),
      });

      setProjects(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load projects");
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="page">
    <div className="container">
      <h1>Client Projects</h1>

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

              <span className={`badge badge-${p.status}`}>
                {p.status}
                </span>

              {/* 💰 Budget visible to client */}
              <div>
                Budget: {p.currency} {p.budget}
              </div>

              <div>
                Professional: {p.professionalId?.name} (
                {p.professionalId?.email})
              </div>

              {latest ? (
                <div style={{ marginTop: 10 }}>
                  Deliverable:
                  <a
                    href={latest.content}
                    target="_blank"
                    rel="noreferrer"
                    style={{ marginLeft: 6 }}
                  >
                    View Work
                  </a>
                </div>
              ) : (
                <p>No deliverable submitted yet</p>
              )}

              {/* 📜 Timeline */}
              {p.timeline && p.timeline.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <h4>Project Timeline</h4>

                  {p.timeline.map((t, i) => (
                    <div key={i}>
                      {t.event} — {new Date(t.date).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}