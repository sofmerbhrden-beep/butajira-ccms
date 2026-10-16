import { Router } from "express";
import {
  getServiceTypes,
  getServiceType,
  createServiceType,
  updateServiceType,
  deleteServiceType,
} from "../controllers/serviceTypeController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createServiceTypeSchema, updateServiceTypeSchema } from "../validator/serviceTypeValidator.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(getServiceTypes)
  .post(requireRole("admin"), validateRequest(createServiceTypeSchema), createServiceType)
  .all(methodNotAllowed("GET, POST"));

router
  .route("/:stId")
  .get(getServiceType)
  .patch(requireRole("admin"), validateRequest(updateServiceTypeSchema), updateServiceType)
  .delete(requireRole("admin"), deleteServiceType)
  .all(methodNotAllowed("GET, PATCH, DELETE"));

export default router;
