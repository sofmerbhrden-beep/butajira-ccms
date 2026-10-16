import { Router } from "express";
import {
  createUser,
  registerUser,
  validateStaffAccessCode,
  validateAdminAccessCode,
  verifyEmail,
  resendVerifyCode,
  forgotPassword,
  resetPassword,
  staffForgotPassword,
  adminForgotPassword,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  replacePassword,
  createPasswordReset,
} from "../controllers/userController.js";
import { protect, requireRole, identify } from "../middleware/authMiddleware.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  registerSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateUserSchema
} from "../validator/userValidator.js";

const router = Router();

router.route("/register").post(validateRequest(registerSchema), registerUser).all(methodNotAllowed("POST"));

router.route("/validate-staff-code").post(validateStaffAccessCode).all(methodNotAllowed("POST"));
router.route("/validate-admin-code").post(validateAdminAccessCode).all(methodNotAllowed("POST"));

router.route("/verify-email").post(protect, validateRequest(verifyEmailSchema), verifyEmail).all(methodNotAllowed("POST"));
router.route("/resend-verify").post(protect, resendVerifyCode).all(methodNotAllowed("POST"));

router.route("/forgot-password").post(validateRequest(forgotPasswordSchema), forgotPassword).all(methodNotAllowed("POST"));
router.route("/reset-password").post(validateRequest(resetPasswordSchema), resetPassword).all(methodNotAllowed("POST"));
router.route("/staff-forgot-password").post(staffForgotPassword).all(methodNotAllowed("POST"));
router.route("/admin-forgot-password").post(adminForgotPassword).all(methodNotAllowed("POST"));

router
  .route("/")
  .post(identify, createUser)
  .get(protect, requireRole("admin"), getUsers)
  .all(methodNotAllowed("GET, POST"));

router
  .route("/:id")
  .get(protect, getUser)
  .patch(protect, requireRole("admin"), validateRequest(updateUserSchema), updateUser)
  .delete(protect, requireRole("admin"), deleteUser)
  .all(methodNotAllowed("GET, PATCH, DELETE"));

router
  .route("/:id/password")
  .put(protect, replacePassword)
  .all(methodNotAllowed("PUT"));

router
  .route("/:id/password-resets")
  .post(protect, requireRole("admin"), createPasswordReset)
  .all(methodNotAllowed("POST"));

export default router;
