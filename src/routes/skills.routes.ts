import { Router } from "express";
import { Storage } from "@google-cloud/storage";
import {
  insertSkill,
  updateSkill,
  getSkills,
  getSkillById,
  deleteSkill,
  getSkillByProfessionalId,
  upload,
} from "../controllers/skills.controllers";
const router = Router();
import passport from "passport";
import multer from "multer";

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/skills/upload",
  passport.authenticate("jwt", { session: false }),
  uploader.single("file"),
  upload
);

router.post(
  "/skills",
  passport.authenticate("jwt", { session: false }),
  insertSkill
);
router.post(
  "/skillById",
  passport.authenticate("jwt", { session: false }),
  getSkillById
);
router.get(
  "/skills",
  passport.authenticate("jwt", { session: false }),
  getSkills
);
router.put(
  "/skills",
  passport.authenticate("jwt", { session: false }),
  updateSkill
);
router.delete(
  "/skills",
  passport.authenticate("jwt", { session: false }),
  deleteSkill
);

export default router;
