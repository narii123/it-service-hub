import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import Register from "./pages/Register";
import AdminJobPosts from "./pages/AdminJobPosts";
import AdminProjects from "./pages/AdminProjects";
import ClientProjects from "./pages/ClientProjects";
import AdminStats from "./pages/AdminStats";
import Navbar from "./components/Navbar";

export default function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN PAGE (no navbar) */}
        <Route path="/" element={<Login />} />

        {/* ADMIN */}
        <Route path="/admin" element={<><Navbar /><AdminDashboard /></>} />
        <Route path="/admin/jobs" element={<><Navbar /><AdminJobPosts /></>} />
        <Route path="/admin/projects" element={<><Navbar /><AdminProjects /></>} />
        <Route path="/admin/stats" element={<><Navbar /><AdminStats /></>} />

        {/* CLIENT */}
        <Route path="/client" element={<><Navbar /><ClientDashboard /></>} />
        <Route path="/client/projects" element={<><Navbar /><ClientProjects /></>} />

        {/* PROFESSIONAL */}
        <Route path="/professional" element={<><Navbar /><ProfessionalDashboard /></>} />

        {/* REGISTER */}
        <Route path="/register" element={<Register />} />

      </Routes>

    </BrowserRouter>
  );
}