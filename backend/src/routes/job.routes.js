const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { createJobFromRequest, listOpenJobs, closeJob ,listAllJobs,} = require("../controllers/job.controller");
const validateObjectId = require("../middleware/validateObjectId");

router.use(requireAuth);

// Admin converts request -> job
router.post("/from-request/:requestId", requireRole("admin"), createJobFromRequest);

// Professionals view open jobs
router.get("/", requireRole("professional"), listOpenJobs);

router.get("/admin", requireRole("admin"), listAllJobs);

// Admin closes job
router.patch("/:id/close", validateObjectId("id"), requireRole("admin"), closeJob);

module.exports = router;