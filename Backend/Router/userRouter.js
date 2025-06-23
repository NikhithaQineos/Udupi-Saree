import express from "express";
import { registerUser, loginUser, getUser, forgotPassword, resetPassword } from "../Controller/userController.js";

const route = express.Router();

route.post("/registration",registerUser);
route.post("/login",loginUser);
route.get("/userlist",getUser);
route.post("/forgot",forgotPassword);
route.post("/reset",resetPassword);

export default route;
