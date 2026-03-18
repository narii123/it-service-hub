const Project = require("../models/Project");
const Application = require("../models/Application");
const JobPost = require("../models/JobPost");
const ServiceRequest = require("../models/ServiceRequest");

// ADMIN: select an application -> create project
async function selectApplicationCreateProject(req, res) {
  try {
    const { applicationId } = req.params;

    const app = await Application.findById(applicationId);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (app.status === "selected") {
      return res.status(400).json({ message: "This application is already selected" });
    }

    if (app.status === "rejected") {
      return res.status(400).json({ message: "This application was rejected" });
    }

    const job = await JobPost.findById(app.jobPostId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "open") {
      return res.status(400).json({ message: "Job is not open" });
    }

    const existingProject = await Project.findOne({ jobPostId: job._id });
    if (existingProject) {
      return res.status(400).json({ message: "Project already created for this job" });
    }

    // 🔴 IMPORTANT: request must be defined BEFORE using it
    const request = await ServiceRequest.findById(job.requestId);
    if (!request) {
      return res.status(404).json({ message: "Original request not found" });
    }

    // calculate pricing
    const budget = job.budget ||request.budget || 0;
    const currency =job.currency ||  request.currency || "USD";

    const platformFee = Math.round(budget * 0.10);
    const professionalPayout = budget - platformFee;

    // create project
    const project = await Project.create({
      clientId: request.clientId,
      professionalId: app.professionalId,
      jobPostId: job._id,

      budget,
      currency,

      platformFee,
      professionalPayout,

      status: "assigned",

      timeline: [
        {
          event: "Project created and professional selected"
        }
      ],

      deliverables: []
    });

    app.status = "selected";
    await app.save();

    await Application.updateMany(
      { jobPostId: job._id, _id: { $ne: app._id } },
      { status: "rejected" }
    );

    job.status = "closed";
    await job.save();

    res.status(201).json({ projectId: project._id, project });

  } catch (err) {
    console.error("PROJECT CREATION ERROR:", err);
    res.status(500).json({
      message: "Failed to create project",
      error: err.message
    });
  }
}


// PROFESSIONAL: submit a deliverable
async function submitDeliverable(req, res) {
  try {
    const { id } = req.params; // project id
    const { type, content, note = "" } = req.body;

    if (!type || !content) {
      return res.status(400).json({ message: "type and content are required" });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // ✅ RULE: only assigned professional can submit (keep this early)
    if (project.professionalId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not assigned to this project" });
    }

    // ✅ RULE 1: prevent submitting deliverable if project completed
    if (project.status === "completed") {
      return res.status(400).json({ message: "Cannot submit deliverable for completed project" });
    }

    // ✅ RULE 2: only allow submit when project is active (not already submitted)
    const allowedStatuses = ["assigned", "in_progress"];
    if (!allowedStatuses.includes(project.status)) {
      return res.status(400).json({ message: `Cannot submit deliverable when project status is '${project.status}'` });
    }

    // ✅ RULE 1b: prevent submitting another deliverable before admin reviews the last one
    const last = project.deliverables[project.deliverables.length - 1];
    if (last && last.adminDecision === "pending") {
      return res.status(400).json({ message: "Wait for admin review before submitting another deliverable" });
    }

    project.deliverables.push({ type, content, note, adminDecision: "pending" });
    project.status = "submitted";

    project.timeline.push({
      event: "Professional submitted deliverable",
    });

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Submit deliverable failed", error: err.message });
  }
}


// ADMIN: approve or request changes for latest deliverable
async function reviewLatestDeliverable(req, res) {
  try {
    const { id } = req.params; // project id
    const { decision } = req.body; // approved or changes_requested

    const allowed = ["approved", "changes_requested"];
    if (!allowed.includes(decision)) {
      return res.status(400).json({ message: "decision must be approved or changes_requested" });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // ✅ RULE: can't review if no deliverables
    if (project.deliverables.length === 0) {
      return res.status(400).json({ message: "No deliverables to review" });
    }

    // ✅ RULE: if already completed, don't review again
    if (project.status === "completed") {
      return res.status(400).json({ message: "Project already completed" });
    }

    // update latest deliverable
    const lastIndex = project.deliverables.length - 1;
    project.deliverables[lastIndex].adminDecision = decision;

    // update project status
    if (decision === "approved") {
      project.status = "completed";
      
      project.timeline.push({
        event: "Project completed",
      });
    }

    if (decision === "changes_requested") project.status = "in_progress";

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Review failed", error: err.message });
  }
}


// ADMIN: get all projects
async function getAllProjects(req, res) {
  // ✅ FIX: admin should see ALL projects, not only their own
  const projects = await Project.find()
    .populate("clientId", "name email")
    .populate("professionalId", "name email")
    .populate("jobPostId", "title status")
    .sort({ createdAt: -1 });

  res.json(projects);
}


// ADMIN: update project status manually
async function updateProjectStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["assigned", "in_progress", "submitted", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ RULE: don't allow changing completed projects
    if (project.status === "completed") {
      return res.status(400).json({ message: "Completed project cannot be modified" });
    }

    // ✅ RULE: only allow moving to "completed" if at least one deliverable exists
    if (status === "completed" && project.deliverables.length === 0) {
      return res.status(400).json({ message: "Cannot complete project without deliverables" });
    }

    project.status = status;
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to update project status", error: err.message });
  }
}


// PROFESSIONAL: get my assigned projects
async function getMyProjectsAsProfessional(req, res) {
  const projects = await Project.find({ professionalId: req.user.id })
    .populate("clientId", "name email")
    .populate("jobPostId", "title status")
    .sort({ createdAt: -1 });

  res.json(projects);
}

// CLIENT: get my projects
async function getMyProjectsAsClient(req, res) {
  const projects = await Project.find({ clientId: req.user.id })
    .populate("professionalId", "name email")
    .populate("jobPostId", "title status")
    .sort({ createdAt: -1 });

  res.json(projects);
}

// ADMIN: platform earnings dashboard
async function getPlatformStats(req, res) {
  try {
    const projects = await Project.find();

    const totalProjects = projects.length;

    let totalBudget = 0;
    let totalPlatformRevenue = 0;

    projects.forEach((p) => {
      totalBudget += Number(p.budget || 0);
      totalPlatformRevenue += Number(p.platformFee || 0);
    });

    const averageProjectValue =
      totalProjects === 0 ? 0 : totalBudget / totalProjects;

    res.json({
      totalProjects,
      totalBudget,
      totalPlatformRevenue,
      averageProjectValue,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load platform stats",
      error: err.message,
    });
  }
}


module.exports = {
  selectApplicationCreateProject,
  submitDeliverable,
  reviewLatestDeliverable,
  getAllProjects,
  getMyProjectsAsProfessional,
  getMyProjectsAsClient,
  updateProjectStatus,
  getPlatformStats
};