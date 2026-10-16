import User from "../models/User.js";
import { sendToken, clearToken } from "../utils/token.js";
import { sessionRepresentation, API_ROOT } from "../utils/representations.js";

async function login(req, res, next, requiredRole = null) {
  try {
    const { username, email, password } = req.body;
    const identifier = (email || username || "").trim();

    if (!identifier || !password)
      return res
        .status(400)
        .json({ message: "Email/Username and password are required" });

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    if (!user.active) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }
    if (!user.emailVerified) {
      sendToken(res, user);
      return res.status(403).json({ message: "Email not verified", emailNotVerified: true });
    }
    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({ message: "Invalid Credentials" });
    }

    sendToken(res, user);
    res
      .status(201)
      .location(`${API_ROOT}/sessions/current`)
      .json(sessionRepresentation(user));
  } catch (err) {
    next(err);
  }
}

export const createSession = (req, res, next) => login(req, res, next);

export const createApplicantSession = (req, res, next) =>
  login(req, res, next, "applicant");
export const createStaffSession = (req, res, next) =>
  login(req, res, next, "staff");
export const createAdminSession = (req, res, next) =>
  login(req, res, next, "admin");

export function getCurrentSession(req, res) {
  res.set("Cache-Control", "no-store");
  res.json(sessionRepresentation(req.user));
}

export function deleteCurrentSession(req, res) {
  clearToken(res);
  res.status(204).end();
}
