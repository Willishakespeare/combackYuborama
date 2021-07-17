import { Router } from "express";
import {
  pay,
  updatePayment,
  getPayments,
  getPaymentById,
  deletePayment,
  prePay,
  payAccepted,
  getPay,
  updatePay,
} from "../controllers/payment.controllers";
const router = Router();
import passport from "passport";

router.post("/pay", passport.authenticate("jwt", { session: false }), pay);
router.post(
  "/paymentById",
  passport.authenticate("jwt", { session: false }),
  getPaymentById
);
router.get(
  "/payments",
  passport.authenticate("jwt", { session: false }),
  getPayments
);
router.put(
  "/payments",
  passport.authenticate("jwt", { session: false }),
  updatePayment
);
router.delete(
  "/payments",
  passport.authenticate("jwt", { session: false }),
  deletePayment
);
router.post("/prePay", prePay);

router.post(
  "/payaccepted",
  passport.authenticate("jwt", { session: false }),
  payAccepted
);

router.post(
  "/getpay",
  passport.authenticate("jwt", { session: false }),
  getPay
);

router.put(
  "/updatepay",
  passport.authenticate("jwt", { session: false }),
  updatePay
);
export default router;
