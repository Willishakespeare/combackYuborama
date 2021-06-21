import { Router } from "express";
import {
  insertDiagnostic,
  getDiagnosticById,
  getDiagnostics,
  updateDiagnostic,
  deleteDiagnostic,
} from "../controllers/diagnostic.controllers";
const router = Router();
import passport from "passport";

router.post(
  "/diagnostic",
  passport.authenticate("jwt", { session: false }),
  insertDiagnostic
);
router.post(
  "/diagnosticById",
  passport.authenticate("jwt", { session: false }),
  getDiagnosticById
);
router.get(
  "/diagnostic",
  passport.authenticate("jwt", { session: false }),
  getDiagnostics
);
router.put(
  "/diagnostic",
  passport.authenticate("jwt", { session: false }),
  updateDiagnostic
);
router.delete(
  "/diagnostic",
  passport.authenticate("jwt", { session: false }),
  deleteDiagnostic
);

export default router;
