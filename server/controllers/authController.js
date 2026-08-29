import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  skills: user.skills,
  location: user.location,
  company: user.company,
  resume: user.resume,
  bio: user.bio,
  createdAt: user.createdAt,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === "recruiter" ? "recruiter" : "candidate",
  });

  res.status(201).json({
    success: true,
    user: publicUser(user),
    token: generateToken(user._id),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    success: true,
    user: publicUser(user),
    token: generateToken(user._id),
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

// @desc    Update own profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");

  const { name, location, company, bio, resume, skills, password } = req.body;

  if (name !== undefined) user.name = name;
  if (location !== undefined) user.location = location;
  if (company !== undefined) user.company = company;
  if (bio !== undefined) user.bio = bio;
  if (resume !== undefined) user.resume = resume;
  if (skills !== undefined) {
    user.skills = Array.isArray(skills)
      ? skills
      : String(skills)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
  }
  if (password) user.password = password;

  const updated = await user.save();

  res.json({ success: true, user: publicUser(updated) });
});
