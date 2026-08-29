import express from "express";
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getStats,
  getRecruiterApplications,
} from "../controllers/applicationController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, getStats);
router.get("/my", protect, authorize("candidate"), getMyApplications);
router.get("/recruiter/all", protect, authorize("recruiter"), getRecruiterApplications);
router.get("/job/:jobId", protect, authorize("recruiter"), getJobApplications);
router.put("/:id/status", protect, authorize("recruiter"), updateApplicationStatus);
router.post("/:jobId", protect, authorize("candidate"), applyToJob);

export default router;
