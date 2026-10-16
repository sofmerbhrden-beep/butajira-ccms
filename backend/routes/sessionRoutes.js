import { Router } from "express";
import {
  createSession,
  createApplicantSession,
  createStaffSession,
  createAdminSession,
  createDemoSession,
  getCurrentSession,
  deleteCurrentSession,
} from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginSchema } from "../validator/userValidator.js";

const router = Router();

router.route("/").post(validateRequest(loginSchema), createSession).all(methodNotAllowed("POST"));

router
  .route("/applicant")
  .post(validateRequest(loginSchema), createApplicantSession)
  .all(methodNotAllowed("POST"));
router
  .route("/v8k2mxp4")
  .post(validateRequest(loginSchema), createStaffSession)
  .all(methodNotAllowed("POST"));
router
  .route("/zq9wr3nt")
  .post(validateRequest(loginSchema), createAdminSession)
  .all(methodNotAllowed("POST"));

router
  .route("/demo/:role")
  .post(createDemoSession)
  .all(methodNotAllowed("POST"));

router
  .route("/current")
  .get(protect, getCurrentSession)
  .delete(deleteCurrentSession)
  .all(methodNotAllowed("GET, DELETE"));

export default router;
