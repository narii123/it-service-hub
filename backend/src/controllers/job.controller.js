const JobPost = require("../models/JobPost");
const ServiceRequest = require("../models/ServiceRequest");

// =============================
// ADMIN: convert approved request -> job post
// =============================
async function createJobFromRequest(req, res) {
  try {
    const { requestId } = req.params;

    const request = await ServiceRequest.findById(requestId);
    if (!request)
      return res.status(404).json({ message: "Request not found" });

    // Must be approved before converting
    if (request.status !== "approved") {
      return res.status(400).json({
        message: "Request must be approved before converting to job post",
      });
    }

    // Prevent duplicate job posts
    const existing = await JobPost.findOne({ requestId });
    if (existing)
      return res
        .status(409)
        .json({ message: "Job post already created for this request" });

    const job = await JobPost.create({
      requestId: request._id,
      createdBy: req.user.id,
      title: request.title,
      description: request.description,
      requiredSkills: request.requiredSkills,
      budget: request.budget,
      currency: request.currency,
      deadline: request.deadline,
      status: "open",
    });

    // Mark request as converted
    request.status = "converted";
    await request.save();

    res.status(201).json(job);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create job post", error: err.message });
  }
}

// =============================
// PROFESSIONAL: list open job posts
// =============================
async function listOpenJobs(req, res) {
  try {
    const jobs = await JobPost.find({ status: "open" })
      .populate("requestId")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load open jobs", error: err.message });
  }
}

// =============================
// ADMIN: list all job posts
// =============================
async function listAllJobs(req, res) {
  try {
    const jobs = await JobPost.find()
      .populate("requestId")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load job posts", error: err.message });
  }
}

// =============================
// ADMIN: close a job post
// =============================
async function closeJob(req, res) {
  try {
    const { id } = req.params;

    const job = await JobPost.findByIdAndUpdate(
      id,
      { status: "closed" },
      { new: true }
    );

    if (!job)
      return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to close job", error: err.message });
  }
}

module.exports = {
  createJobFromRequest,
  listOpenJobs,
  listAllJobs,   // <-- NEW
  closeJob,
};