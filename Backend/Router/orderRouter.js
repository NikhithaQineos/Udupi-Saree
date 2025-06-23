import express from "express";
import { createOrder ,getOrder,getOrdersByUserId,cancelOrder,orderasdelivered} from "../Controller/orderController.js";

const router = express.Router();

router.post("/createorder",createOrder);
router.get("/getOrder",getOrder);
router.get("/getOrdersByUserId/:id",getOrdersByUserId);
router.put("/cancelOrder/:id",cancelOrder);
router.put("/orderasdelivered/:id",orderasdelivered);


export default router;