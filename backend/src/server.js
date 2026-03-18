const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});
const requestRoutes = require("./routes/request.routes");
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/job.routes");
const applicationRoutes = require("./routes/application.routes");
const projectRoutes = require("./routes/project.routes");
const errorHandler = require("./middleware/errorHandler");

app.use(cors());
app.use(express.json());
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/projects", projectRoutes);
app.use(errorHandler);

app.get("/", (req, res) => res.send("API is running"));
app.get("/health", (req, res) =>
  res.json({ ok: true, message: "Backend is running" })
);

// 🔹 CONNECT TO MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message)
  );

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log("✅ Listening on http://127.0.0.1:" + PORT);
});
