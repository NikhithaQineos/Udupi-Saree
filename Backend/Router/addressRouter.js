import express from "express";
import { createAddress, addressById, deleteAddress,updateAddress } from "../Controller/addressController.js";

const route = express.Router();

route.post("/createAddress",createAddress);
route.get("/getAddress/:userId",addressById);
route.delete("/address/:userId/:addressId", deleteAddress);
route.put("/address/:userId/:addressId", updateAddress);

export default route;