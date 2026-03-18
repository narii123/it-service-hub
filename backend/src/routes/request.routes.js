const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { createRequest, getAllRequests, updateRequestStatus, assignProfessional } =require("../controllers/request.controller");
const validateObjectId = require("../middleware/validateObjectId");

router.use(requireAuth);

router.post("/", requireRole("client"), createRequest);
router.get("/", requireRole("admin"), getAllRequests);
router.patch("/:id/status", validateObjectId("id"), requireRole("admin"), updateRequestStatus);
router.patch("/:id/assign", validateObjectId("id"), requireRole("admin"), assignProfessional);

module.exports = router;