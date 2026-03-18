import { useState } from "react";
import { Link } from "react-router-dom";
import { api, authHeaders } from "../api/api";
import "../styles/dashboard.css";

export default function ClientDashboard() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [message, setMessage] = useState("");

  async function createRequest(e) {
    e.preventDefault();

    try {
      await api.post(
        "/api/requests",
        {
          title,
          description,
          requiredSkills: skills.split(","),
          budget: Number(budget),
          currency
        },
        { headers: authHeaders() }
      );

      setMessage("✅ Request submitted successfully");

      setTitle("");
      setDescription("");
      setSkills("");
      setBudget("");

    } catch (err) {
      setMessage("❌ Failed to submit request");
    }
  }

  return (
    <div className="page">
      <div className="container">

        <h1>Client Dashboard</h1>

        <div style={{ marginBottom: 20 }}>
          <Link to="/client/projects">
            <button style={{ padding: 12, width: 250 }}>
              View My Projects
            </button>
          </Link>
        </div>

        <h3>Create Service Request</h3>

        <form
          onSubmit={createRequest}
          style={{
            maxWidth: 600,
            display: "flex",
            flexDirection: "column",
            gap: 15
          }}
        >

          <input
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 10 }}
          />

          <textarea
            placeholder="Project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: 10 }}
          />

          <input
            placeholder="Required skills (React,Node,CSS)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            style={{ padding: 10 }}
          />

          <div style={{ display: "flex", gap: 10 }}>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ padding: 10, width:120}}
            >
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>

            <input
              type="number"
              placeholder="Budget amount"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              style={{ padding: 10, flex: 1 }}
            />

          </div>

          <button
            type="submit"
            style={{
              padding: 12,
              background: "#3b6fb6",
              color: "white",
              border: "none",
              cursor: "pointer"
            }}
          >
            Submit Request
          </button>

        </form>

        {message && (
          <p style={{ marginTop: 10, color: "green" }}>
            {message}
          </p>
        )}

      </div>
    </div>
  );
}