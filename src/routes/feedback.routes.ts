import { Router } from "express";
import {
  addFeedback,
  updateFeedback,
  getFeedbacks,
  getFeedbackById,
  deleteFeedback,
} from "../controllers/feedback.controllers";
const router = Router();
import passport from "passport";

router.post(
  "/feedback",
  passport.authenticate("jwt", { session: false }),
  addFeedback
);

router.post(
  "/feedbackById",
  passport.authenticate("jwt", { session: false }),
  getFeedbackById
);
router.get(
  "/feedback",
  passport.authenticate("jwt", { session: false }),
  getFeedbacks
);
router.put(
  "/feedback",
  passport.authenticate("jwt", { session: false }),
  updateFeedback
);
router.delete(
  "/feedback",
  passport.authenticate("jwt", { session: false }),
  deleteFeedback
);

export default router;
