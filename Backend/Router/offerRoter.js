import express from "express";
import { createOffer, getOffers, deleteOffer } from "../Controller/offerController.js";

const router = express.Router();

router.post("/create", createOffer);
router.get("/list", getOffers);
router.delete("/delete/:id", deleteOffer);

export default router;