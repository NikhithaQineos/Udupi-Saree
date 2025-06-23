import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import adminRouter from "./Router/adminRouter.js"
import categoryRouter from "./Router/categoryRouter.js"
import productRouter from "./Router/productRouter.js"
import addressRouter from "./Router/addressRouter.js"
import contactusRouter from "./Router/contactusRouter.js"
import orderRouter from "./Router/orderRouter.js";
import wishlistRouter from "./Router/wishlistRouter.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import userRouter from "./Router/userRouter.js"
import cors from "cors";
import razorpayrouter from "./Router/razorpayRouter.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
dotenv.config();

import Razorpay from "razorpay";
app.use(cors());
app.use(express.json()); // very important to parse incoming JSON

const port=process.env.PORT;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port,()=>{
    connectDB();
    console.log("server is running at port :"+port);
})

app.use("/api",adminRouter);
app.use("/api",categoryRouter);
app.use("/api",userRouter);
app.use("/api",productRouter);
app.use("/api",addressRouter);
app.use("/api",contactusRouter);
app.use("/api",orderRouter);
app.use("/api",wishlistRouter);
app.use("/api",razorpayrouter);