import { Router } from "express";
import {
insertCondition
} from "../controllers/observation.controllers";
const router = Router();
import passport from "passport";

router.post(
  "/observation",
  passport.authenticate("jwt", { session: false }),
  insertCondition
);

export default router;
