import express from "express";
import { addremoveWishlist, getWishlist, deleteWishlist } from "../Controller/wishlistController.js";

const route = express.Router();
route.post("/addremove",addremoveWishlist);
route.get("/getwishlist/:userId",getWishlist);
route.delete("/clear/:userId",deleteWishlist);

export default route;