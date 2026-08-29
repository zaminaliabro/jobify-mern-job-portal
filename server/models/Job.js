import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    salary: {
      type: Number,
      default: 0,
      min: [0, "Salary cannot be negative"],
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote"],
      default: "Full-time",
    },
    category: {
      type: String,
      default: "Other",
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text", company: "text" });

export default mongoose.model("Job", jobSchema);
