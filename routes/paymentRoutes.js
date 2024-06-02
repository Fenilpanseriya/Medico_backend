import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { createOrder, paymentVerification, razorpayKey } from "../controllers/paymentController.js";
const router=express.Router();

router.get("/getKey",isAuthenticated,razorpayKey);
router.post("/create-order",isAuthenticated,createOrder);
router.post("/verification",isAuthenticated,paymentVerification);
export default router