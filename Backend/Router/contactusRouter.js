import express from "express";
import { createContact, getContact, deleteMessege } from "../Controller/contactusController.js";

const route = express.Router();

route.post("/Messege",createContact);
route.get("/getMessege",getContact);
route.delete("/deleteMsg/:id",deleteMessege);

export default route;