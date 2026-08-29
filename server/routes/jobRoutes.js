import express from "express";
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} from "../controllers/jobController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/recruiter/my", protect, authorize("recruiter"), getMyJobs);

router
  .route("/")
  .get(getJobs)
  .post(protect, authorize("recruiter"), createJob);

router
  .route("/:id")
  .get(getJobById)
  .put(protect, authorize("recruiter"), updateJob)
  .delete(protect, authorize("recruiter"), deleteJob);

export default router;
