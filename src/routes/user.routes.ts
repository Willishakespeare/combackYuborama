import { Router } from "express";
import {
  deleteUser,
  updateUser,
  getByRole,
  getUserById,
  uploadImage,
} from "../controllers/user.controllers";
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
  "/user/uploadimage",
  passport.authenticate("jwt", { session: false }),
  uploader.single("file"),
  uploadImage
);

router.put(
  "/user",
  passport.authenticate("jwt", { session: false }),
  updateUser
);
router.delete(
  "/user",
  passport.authenticate("jwt", { session: false }),
  deleteUser
);
router.post(
  "/user/role",
  passport.authenticate("jwt", { session: false }),
  getByRole
);

router.post(
  "/user/userbyid",
  passport.authenticate("jwt", { session: false }),
  getUserById
);

export default router;
