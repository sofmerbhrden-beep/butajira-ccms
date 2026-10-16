import crypto from "crypto";
import User from "../models/User.js";
import { sendToken } from "../utils/token.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";
import {
  userRepresentation,
  collectionRepresentation,
  parsePagination,
  API_ROOT,
} from "../utils/representations.js";

function genTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from(
    crypto.randomBytes(10),
    (b) => chars[b % chars.length],
  ).join("");
}

export async function validateStaffAccessCode(req, res, next) {
  try {
    const { accessCode } = req.body;
    if (!accessCode?.trim())
      return res.status(400).json({ message: "Access code is required" });
    if (accessCode.trim() !== process.env.STAFF_ACCESS_CODE)
      return res.status(403).json({ message: "Invalid access code" });
    res.json({ valid: true });
  } catch (err) {
    next(err);
  }
}

export async function validateAdminAccessCode(req, res, next) {
  try {
    const { accessCode } = req.body;
    if (!accessCode?.trim())
      return res.status(400).json({ message: "Access code is required" });
    if (accessCode.trim() !== process.env.ADMIN_ACCESS_CODE)
      return res.status(403).json({ message: "Invalid access code" });
    res.json({ valid: true });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email?.trim())
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { username: email.trim() }
      ],
      role: "applicant",
    });
    if (!user)
      return res.status(404).json({ message: "No account found with that email." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    const resetUrl = `${origin}/reset-password?token=${token}`;
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      console.log("[mailer] applicant reset email sent to", user.email);
    } catch (mailErr) {
      console.error("[mailer] FAILED to send applicant reset email:", mailErr.message);
      return res.status(500).json({ message: "Failed to send email. Please try again later." });
    }

    res.json({ message: "Reset link sent to " + user.email });
  } catch (err) {
    next(err);
  }
}

export async function staffForgotPassword(req, res, next) {
  try {
    const { accessCode, email } = req.body;
    if (!accessCode?.trim())
      return res.status(400).json({ message: "Access code is required" });
    if (accessCode.trim() !== process.env.STAFF_ACCESS_CODE)
      return res.status(403).json({ message: "Invalid access code" });
    if (!email?.trim())
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { username: email.trim() }
      ],
      role: "staff",
    });
    if (!user)
      return res.status(404).json({ message: "No staff account found with that email." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    const resetUrl = `${origin}/reset-password?token=${token}`;
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      console.log("[mailer] staff reset email sent to", user.email);
    } catch (mailErr) {
      console.error("[mailer] FAILED to send staff reset email:", mailErr.message);
      return res.status(500).json({ message: "Failed to send email. Please try again later." });
    }

    res.json({ message: "Reset link sent to " + user.email });
  } catch (err) {
    next(err);
  }
}

export async function adminForgotPassword(req, res, next) {
  try {
    const { accessCode, email } = req.body;
    if (!accessCode?.trim())
      return res.status(400).json({ message: "Access code is required" });
    if (accessCode.trim() !== process.env.ADMIN_ACCESS_CODE)
      return res.status(403).json({ message: "Invalid access code" });
    if (!email?.trim())
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { username: email.trim() }
      ],
      role: "admin",
    });
    if (!user)
      return res.status(404).json({ message: "No admin account found with that email." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    const resetUrl = `${origin}/reset-password?token=${token}`;
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      console.log("[mailer] admin reset email sent to", user.email);
    } catch (mailErr) {
      console.error("[mailer] FAILED to send admin reset email:", mailErr.message);
      return res.status(500).json({ message: "Failed to send email. Please try again later." });
    }

    res.json({ message: "Reset link sent to " + user.email });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    if (password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    const user = await User.findOne({ resetToken: token }).select(
      "+resetToken +resetTokenExpires",
    );
    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date())
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired" });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
}

export async function registerUser(req, res, next) {
  try {
    const { username, fullName, password, role, accessCode, email } = req.body;

    const allowedRoles = ["applicant", "staff", "admin"];
    const targetRole = allowedRoles.includes(role) ? role : "applicant";

    if (targetRole === "staff" || targetRole === "admin") {
      const accessCodeEnv =
        targetRole === "staff"
          ? process.env.STAFF_ACCESS_CODE
          : process.env.ADMIN_ACCESS_CODE;
      if (!email?.trim())
        return res.status(400).json({ message: "Email is required" });
      if (!password || password.length < 8)
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters" });
      if (accessCode !== accessCodeEnv)
        return res.status(403).json({ message: "Invalid access code" });

      const exists = await User.findOne({ email: email.trim().toLowerCase() });
      if (exists)
        return res
          .status(409)
          .json({ message: "An account with that email already exists" });

      const user = await User.create({
        username: email.trim().toLowerCase(),
        fullName: fullName?.trim() || "",
        password,
        role: targetRole,
        email: email.trim().toLowerCase(),
      });

      sendToken(res, user);
      return res
        .status(201)
        .location(`${API_ROOT}/users/${user._id}`)
        .json(userRepresentation(user, { requester: user }));
    }


    if (!email?.trim())
      return res.status(400).json({ message: "Email is required" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return res.status(400).json({ message: "Enter a valid email address" });
    if (!password || password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists)
      return res
        .status(409)
        .json({ message: "An account with that email already exists" });

    const user = await User.create({
      username: email.trim().toLowerCase(),
      fullName: fullName?.trim() || "",
      password,
      role: targetRole,
      email: email.trim().toLowerCase(),
      active: true,
    });

    sendToken(res, user);
    return res
      .status(201)
      .location(`${API_ROOT}/users/${user._id}`)
      .json(userRepresentation(user, { requester: user }));
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const isAdmin = req.user?.role === "admin";
    const { username, fullName, password, role, email } = req.body;

    if (!username?.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }

    const exists = await User.findOne({
      username: username.trim().toLowerCase(),
    });
    if (exists) {

      return res.status(409).json({ message: "Username is already taken" });
    }

    let user;
    let tempPassword = null;

    if (isAdmin) {
      if (!["applicant", "staff", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      tempPassword = genTempPassword();
      user = await User.create({
        username: username.trim(),
        fullName: fullName?.trim() || "",
        password: tempPassword,
        role,
        mustChangePassword: true,
        ...(email?.trim() && { email: email.trim().toLowerCase() }),
      });
    } else {
      if (!password || password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters" });
      }
      user = await User.create({
        username: username.trim(),
        fullName: fullName?.trim() || "",
        password,
        role: "applicant",
      });
      sendToken(res, user);
    }

    const rep = userRepresentation(user, { requester: req.user || user });
    if (tempPassword) rep.tempPassword = tempPassword;


    res.status(201).location(`${API_ROOT}/users/${user._id}`).json(rep);
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req);
    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.set("Cache-Control", "private, no-cache");
    res.json(
      collectionRepresentation(res, {
        items: users.map((u) => userRepresentation(u, { requester: req.user })),
        page,
        limit,
        total,
        baseHref: `${API_ROOT}/users`,
      }),
    );
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).catch(() => null);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (req.user.role !== "admin" && !user._id.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    res.set("Cache-Control", "private, no-cache");
    res.json(userRepresentation(user, { requester: req.user }));
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).catch(() => null);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { active, fullName, role } = req.body;

    if (active !== undefined) {
      if (user._id.equals(req.user._id)) {
        return res
          .status(409)
          .json({ message: "You can't deactivate your own account" });
      }
      user.active = !!active;
    }
    if (fullName !== undefined) user.fullName = String(fullName).trim();
    if (role !== undefined) {
      if (!["applicant", "staff", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (user._id.equals(req.user._id)) {
        return res
          .status(409)
          .json({ message: "You can't change your own role" });
      }
      user.role = role;
    }

    await user.save();
    res.json(userRepresentation(user, { requester: req.user }));
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).catch(() => null);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user._id.equals(req.user._id)) {
      return res
        .status(409)
        .json({ message: "You can't delete your own account" });
    }

    await user.deleteOne();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function replacePassword(req, res, next) {
  try {
    if (!req.user._id.equals(req.params.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.params.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function createPasswordReset(req, res, next) {
  try {
    const user = await User.findById(req.params.id).catch(() => null);
    if (!user) return res.status(404).json({ message: "User not found" });

    const tempPassword = genTempPassword();
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();

    res.status(201).json({
      ...userRepresentation(user, { requester: req.user }),
      tempPassword,
    });
  } catch (err) {
    next(err);
  }
}
