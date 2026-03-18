const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");

// CLIENT: create request
async function createRequest(req, res) {
  try {

    const { title, description, requiredSkills = [], budget, currency = "USD", deadline } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "title and description required" });
    }

    if (!budget) {
      return res.status(400).json({ message: "budget is required" });
    }

    // PLATFORM CUT (10%)
    const platformFee = Number(budget) * 0.1;

    // PROFESSIONAL PAYOUT
    const professionalPayout = Number(budget) - platformFee;

    const request = await ServiceRequest.create({
      clientId: req.user.id,
      title,
      description,
      requiredSkills,
      budget: Number(budget),
      currency,
      platformFee,
      professionalPayout,
      deadline
    });

    res.status(201).json(request);

  } catch (err) {
    res.status(500).json({
      message: "Failed to create request",
      error: err.message
    });
  }
}

// ADMIN: list all requests
async function getAllRequests(req, res) {
  const requests = await ServiceRequest.find()
    .populate("clientId", "name email")
    .sort({ createdAt: -1 });

  res.json(requests);
}

// ADMIN: update request status
async function updateRequestStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["submitted", "under_review", "approved", "rejected", "converted", "assigned"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const request = await ServiceRequest.findByIdAndUpdate(id, { status }, { new: true });
  if (!request) return res.status(404).json({ message: "Request not found" });

  res.json(request);
}

// ADMIN: assign professional to a request
async function assignProfessional(req, res) {
  try {
    const { id } = req.params; // request id
    const { professionalId } = req.body;

    if (!professionalId) {
      return res.status(400).json({ message: "professionalId is required" });
    }

    // check the user exists
    const pro = await User.findById(professionalId);
    if (!pro) return res.status(404).json({ message: "Professional not found" });

    // check role
    if (pro.role !== "professional") {
      return res.status(400).json({ message: "User is not a professional" });
    }

    // assign + update status
    const updated = await ServiceRequest.findByIdAndUpdate(
      id,
      { assignedProfessionalId: professionalId, status: "assigned" },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Request not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Assign failed", error: err.message });
  }
}

module.exports = { createRequest, getAllRequests, updateRequestStatus, assignProfessional };