const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { getPlatformStats } = require("../controllers/project.controller");

const {
  selectApplicationCreateProject,
  submitDeliverable,
  reviewLatestDeliverable,
  getAllProjects,
  getMyProjectsAsProfessional,
  getMyProjectsAsClient,
  updateProjectStatus
} = require("../controllers/project.controller");

const validateObjectId = require("../middleware/validateObjectId");

router.use(requireAuth);
// admin: all projects
router.get("/", requireRole("admin"), getAllProjects);

router.get("/me", requireRole("professional"), getMyProjectsAsProfessional);

router.get("/my", requireRole("client"), getMyProjectsAsClient);

router.post(
  "/from-application/:applicationId",
  validateObjectId("applicationId"),
  requireRole("admin"),
  selectApplicationCreateProject
);

router.patch(
  "/:id/status",
  validateObjectId("id"),
  requireRole("admin"),
  updateProjectStatus
);

router.post(
  "/:id/deliverables",
  validateObjectId("id"),
  requireRole("professional"),
  submitDeliverable
);

router.patch(
  "/:id/deliverables/review",
  validateObjectId("id"),
  requireRole("admin"),
  reviewLatestDeliverable
);

// ⭐ ADD THIS
router.get(
  "/stats/platform",
  requireRole("admin"),
  getPlatformStats
);
module.exports = router;