import express from "express";
import { createRazorpayOrder } from "../Controller/razorpaycontroller.js";

const router = express.Router();

router.post("/create-razorpay-order", createRazorpayOrder);

export default router;
