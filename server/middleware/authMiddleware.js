import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Not authorized, no token"));
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      return next(new Error("Not authorized, user no longer exists"));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Not authorized, token failed"));
  }
};

// Usage: authorize("recruiter") or authorize("candidate", "recruiter")
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Access denied. Requires role: ${roles.join(" or ")}`));
    }
    next();
  };
