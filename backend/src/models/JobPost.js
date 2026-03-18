const mongoose = require("mongoose");

const jobPostSchema = new mongoose.Schema(
{
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  requiredSkills: [{ type: String }],

  // 💰 pricing fields
  budget: { type: Number },

  currency: {
    type: String,
    default: "USD"
  },

  deadline: { type: Date },

  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open"
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("JobPost", jobPostSchema);