import { Router } from "express";
import {
  insertPack,
  updatePack,
  getPacks,
  getPackById,
  deletePack,
} from "../controllers/packs.controllers";
const router = Router();
import passport from "passport";

router.post(
  "/packs",
  passport.authenticate("jwt", { session: false }),
  insertPack
);
router.post(
  "/packById",
  passport.authenticate("jwt", { session: false }),
  getPackById
);
router.get(
  "/packs",
  passport.authenticate("jwt", { session: false }),
  getPacks
);
router.put(
  "/packs",
  passport.authenticate("jwt", { session: false }),
  updatePack
);
router.delete(
  "/packs",
  passport.authenticate("jwt", { session: false }),
  deletePack
);

export default router;
