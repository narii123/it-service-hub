import { Link } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  const role = localStorage.getItem("role");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  }

  return (
    <div style={{
      background: "#000ff0",
      color: "white",
      padding: "15px",
      display: "flex",
      justifyContent: "space-between"
    }}>
      <div>
        <b>IT Service Hub</b>
      </div>

      <div style={{ display: "flex", gap: "15px" }}>
        {role === "admin" && <Link style={{color:"white"}} to="/admin">Admin</Link>}
        {role === "professional" && <Link style={{color:"white"}} to="/professional">Professional</Link>}
        {role === "client" && <Link style={{color:"white"}} to="/client">Client</Link>}

        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}