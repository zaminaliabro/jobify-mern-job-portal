import mongoose from "mongoose";

export const APPLICATION_STATUSES = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Rejected",
  "Hired",
];

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: String,
      default: "",
      trim: true,
    },
    coverLetter: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "Applied",
    },
  },
  { timestamps: true }
);

// One application per candidate per job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
