import { Router } from "express";
import {
  insertAppoiment,
  updateAppoiment,
  getAppoiments,
  getAppoimentById,
  deleteAppoiment,
} from "../controllers/appoiments.controllers";
const router = Router();
import passport from "passport";

router.post(
  "/appoiments",
  passport.authenticate("jwt", { session: false }),
  insertAppoiment
);
router.post(
  "/appoimentsById",
  passport.authenticate("jwt", { session: false }),
  getAppoimentById
);
router.get(
  "/appoiments",
  passport.authenticate("jwt", { session: false }),
  getAppoiments
);
router.put(
  "/appoiments",
  passport.authenticate("jwt", { session: false }),
  updateAppoiment
);
router.delete(
  "/appoiments",
  passport.authenticate("jwt", { session: false }),
  deleteAppoiment
);

export default router;
