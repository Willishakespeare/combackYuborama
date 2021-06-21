import { Router } from "express";
import {
  insertCondition,
  updateCondition,
  getConditions,
  getConditionById,
  getConditionByUserId,
  deleteCondition,
} from "../controllers/condition.controllers";
const router = Router();
import passport from "passport";

router.post(
  "/conditions",
  passport.authenticate("jwt", { session: false }),
  insertCondition
);
router.post(
  "/conditionById",
  passport.authenticate("jwt", { session: false }),
  getConditionById
);
router.post(
  "/conditionByUserId",
  passport.authenticate("jwt", { session: false }),
  getConditionByUserId
);
router.get(
  "/conditions",
  passport.authenticate("jwt", { session: false }),
  getConditions
);
router.put(
  "/conditions",
  passport.authenticate("jwt", { session: false }),
  updateCondition
);
router.delete(
  "/conditions",
  passport.authenticate("jwt", { session: false }),
  deleteCondition
);

export default router;
