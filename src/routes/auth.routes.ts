import { Router } from "express";
import {
  registerClient,
  registerDoctor,
  login,
  auth,
  verify,
} from "../controllers/auth.controllers";
const router = Router();
import passport from "passport";

router.post("/register", registerClient);
router.post("/registerdoctor", registerDoctor);
router.post("/login", login);
router.get("/auth", passport.authenticate("jwt", { session: false }), auth);
router.post("/verify", verify);

export default router;
