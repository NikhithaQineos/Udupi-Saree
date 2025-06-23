import express from "express";
import { registration,login } from "../Controller/adminController.js";

const route=express.Router();

route.post("/admin/registration",registration);
route.post("/admin/login",login);

export default route;