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

export async function createDemoSession(req, res, next) {
  try {
    if (process.env.ENABLE_DEMO_LOGINS !== "true") {
      return res.status(403).json({ message: "Demo logins are disabled on this server." });
    }

    const demoAccounts = {
      applicant: {
        username: process.env.DEMO_APPLICANT_USERNAME?.trim().toLowerCase() || "demo-applicant",
        password: process.env.DEMO_APPLICANT_PASSWORD,
        fullName: "Demo Applicant",
      },
      staff: {
        username: process.env.DEMO_STAFF_USERNAME?.trim().toLowerCase() || "demo-staff",
        password: process.env.DEMO_STAFF_PASSWORD,
        fullName: "Demo Staff",
      },
      admin: {
        username: process.env.DEMO_ADMIN_USERNAME?.trim().toLowerCase() || "demo-admin",
        password: process.env.DEMO_ADMIN_PASSWORD,
        fullName: "Demo Administrator",
      },
    };
    const account = Object.hasOwn(demoAccounts, req.params.role)
      ? demoAccounts[req.params.role]
      : null;
    if (!account) return res.status(400).json({ message: "Invalid demo role." });
    if (!account.password || account.password.length < 12) {
      return res.status(503).json({ message: "This demo login is not configured." });
    }

    let user = await User.findOne({ username: account.username }).select("+password");
    if (user && user.role !== req.params.role) {
      return res.status(409).json({ message: "The configured demo username is already in use." });
    }

    if (!user) {
      try {
        await User.create({
          username: account.username,
          fullName: account.fullName,
          password: account.password,
          role: req.params.role,
          active: true,
        });
      } catch (err) {
        if (err?.code !== 11000) throw err;
      }
      user = await User.findOne({ username: account.username }).select("+password");
    }

    if (!user || !(await user.matchPassword(account.password))) {
      return res.status(409).json({ message: "The demo account does not match its server configuration." });
    }
    if (!user.active) {
      return res.status(403).json({ message: "This demo account has been deactivated." });
    }

    sendToken(res, user);
    return res
      .status(201)
      .location(`${API_ROOT}/sessions/current`)
      .json(sessionRepresentation(user));
  } catch (err) {
    next(err);
  }
}

export function getCurrentSession(req, res) {
  res.set("Cache-Control", "no-store");
  res.json(sessionRepresentation(req.user));
}

export function deleteCurrentSession(req, res) {
  clearToken(res);
  res.status(204).end();
}
