import bcrypt from "bcryptjs";

import prisma from "../config/db.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import { normalizeSkills } from "../constants.js";

// Never let the password hash reach a response.
const publicUser = ({ password, ...user }) => user;

const hash = (plain) => bcrypt.hash(plain, 10);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  if (String(password).length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (exists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const user = await prisma.user.create({
    data: {
      name: String(name).trim(),
      email: normalizedEmail,
      password: await hash(password),
      role: role === "recruiter" ? "recruiter" : "candidate",
    },
  });

  res.status(201).json({
    success: true,
    user: publicUser(user),
    token: generateToken(user.id),
  });
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase().trim() },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    success: true,
    user: publicUser(user),
    token: generateToken(user.id),
  });
});

// @desc    Current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

// @desc    Update own profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, location, company, bio, resume, skills, password } = req.body;

  const data = {};
  if (name !== undefined) data.name = String(name).trim();
  if (location !== undefined) data.location = String(location).trim();
  if (company !== undefined) data.company = String(company).trim();
  if (bio !== undefined) data.bio = String(bio).trim();
  if (resume !== undefined) data.resume = String(resume).trim();

  const nextSkills = normalizeSkills(skills);
  if (nextSkills !== undefined) data.skills = nextSkills;

  if (password) {
    if (String(password).length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    data.password = await hash(password);
  }

  const user = await prisma.user.update({ where: { id: req.user.id }, data });

  res.json({ success: true, user: publicUser(user) });
});
