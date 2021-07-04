import { Router } from "express";
import { subscription } from "../controllers/webpush.controllers";
const router = Router();

router.post("/subscription", subscription);

export default router;
