import { useState } from "react";
import axios from "axios";
import "../styles/login.css";

export default function Login() {

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");

  async function handleLogin(e){
    e.preventDefault();

    try{
      const res = await axios.post(
        "http://127.0.0.1:5050/api/auth/login",
        { email,password }
      );

      const role = res.data.user.role;

      localStorage.setItem("token",res.data.token);
      localStorage.setItem("role",role);

      if(role==="admin") window.location.href="/admin";
      else if(role==="professional") window.location.href="/professional";
      else window.location.href="/client";

    }catch(err){
      setMessage(err?.response?.data?.message || "Login failed");
    }
  }

  return (

    <div className="login-page">

      <div className="login-card">

        <h1>IT Service Hub</h1>

        <p className="subtitle">
          Login to your account
        </p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        {message && <p>{message}</p>}

        <p className="register">
          Don't have an account? <a href="/register">Register</a>
        </p>

      </div>

    </div>
  );
}