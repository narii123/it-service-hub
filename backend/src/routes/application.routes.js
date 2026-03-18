const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  applyToJob,
  getApplicationsForJob,
  updateApplicationStatus,
} = require("../controllers/application.controller");
const validateObjectId = require("../middleware/validateObjectId");

router.use(requireAuth);

// professional applies
router.post("/", requireRole("professional"), applyToJob);

// admin views applications per job
router.get("/job/:jobId", requireRole("admin"), getApplicationsForJob);

// admin updates application status
router.patch("/:id/status", validateObjectId("id"), requireRole("admin"), updateApplicationStatus);

module.exports = router;