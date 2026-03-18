const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobPostId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPost", required: true },
    professionalId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "rejected", "selected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// prevent same professional applying twice to same job
applicationSchema.index({ jobPostId: 1, professionalId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);