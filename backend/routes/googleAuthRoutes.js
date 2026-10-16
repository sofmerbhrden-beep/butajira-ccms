import { Router } from "express";
import passport, { googleOAuthEnabled } from "../config/passport.js";
import { sendToken } from "../utils/token.js";

const router = Router();

function requireGoogleOAuth(req, res, next) {
  if (!googleOAuthEnabled) {
    return res
      .status(503)
      .json({ message: "Google sign-in is not configured" });
  }
  next();
}

router.get(
  "/google",
  requireGoogleOAuth,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account consent",
    access_type: "online",
  }),
);

router.get(
  "/google/callback",
  requireGoogleOAuth,
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/auth/login?error=google_failed`,
  }),
  (req, res) => {
    sendToken(res, req.user);

    req.logout(() => {});
    res.redirect(`${process.env.CLIENT_ORIGIN}/applicant/dashboard`);
  },
);

export default router;
