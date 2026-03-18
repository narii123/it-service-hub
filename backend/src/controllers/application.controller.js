const Application = require("../models/Application");
const JobPost = require("../models/JobPost");

// PROFESSIONAL: apply to a job
async function applyToJob(req, res) {
  try {
    const { jobPostId, coverLetter = "" } = req.body;
    if (!jobPostId) return res.status(400).json({ message: "jobPostId is required" });

    const job = await JobPost.findById(jobPostId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== "open") return res.status(400).json({ message: "Job is not open" });

    const application = await Application.create({
      jobPostId,
      professionalId: req.user.id,
      coverLetter,
    });

    res.status(201).json(application);
  } catch (err) {
    // duplicate apply error
    if (err.code === 11000) {
      return res.status(409).json({ message: "You already applied to this job" });
    }
    res.status(500).json({ message: "Failed to apply", error: err.message });
  }
}

// ADMIN: view applications for a job
async function getApplicationsForJob(req, res) {
  const { jobId } = req.params;

  const apps = await Application.find({ jobPostId: jobId })
    .populate("professionalId", "name email role")
    .sort({ createdAt: -1 });

  res.json(apps);
}

// ADMIN: update application status (shortlist/reject/select)
async function updateApplicationStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["pending", "shortlisted", "rejected", "selected"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const updated = await Application.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) return res.status(404).json({ message: "Application not found" });

  res.json(updated);
}

module.exports = { applyToJob, getApplicationsForJob, updateApplicationStatus };