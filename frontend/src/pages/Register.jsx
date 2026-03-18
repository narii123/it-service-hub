import { useState } from "react";
import axios from "axios";
import "../styles/login.css";

export default function Register() {
  const API = import.meta.env.VITE_API_URL;

  const [name, setName] = useState("");
  const [role, setRole] = useState("client"); // client or professional
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [skills, setSkills] = useState("");

  console.log("REGISTER CLICKED");
  async function handleRegister(e) {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(`${API}/api/auth/register`, {
        name,
        email,
        password,
        role,
        skills: role === "professional"
          ? skills.split(",").map(s => s.trim()).filter(Boolean)
          : []
      });

      setMessage("✅ Account created! Now login.");
    } catch (err) {
        console.log(err);
        const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Register failed";
        setMessage(`❌ ${msg}`);
    }
  }

  return (
    <div className="login-container">
      <h2>IT Service Hub</h2>
      <p className="subtitle">Register</p>

      <form onSubmit={handleRegister}>
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="client">Client</option>
          <option value="professional">Professional</option>
        </select>

        {role === "professional" && (
          <input
            placeholder="Skills (comma separated) e.g. React, Node, AWS"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Create account</button>
      </form>

      {message && <p className="message">{message}</p>}

      <p style={{ marginTop: 10 }}>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  );
}