const mongoose = require("mongoose");

const deliverableSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["text", "link"], required: true },
    content: { type: String, required: true },
    note: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },

    adminDecision: {
      type: String,
      enum: ["pending", "approved", "changes_requested"],
      default: "pending",
    },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    event: String,
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    jobPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost",
      required: true,
    },

    // 💰 project pricing
    budget: { type: Number, default: 0 },

    currency: { type: String, default: "USD" },

    platformFee: { type: Number, default: 0 },

    professionalPayout: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["assigned", "in_progress", "submitted", "completed"],
      default: "assigned",
    },

    deliverables: [deliverableSchema],

    // 📜 timeline system
    timeline: [timelineSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);