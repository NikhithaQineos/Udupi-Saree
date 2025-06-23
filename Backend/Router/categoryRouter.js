import express from "express";
import { createcategory,getcategory ,updatecategory,deletecategory} from "../Controller/categoryController.js";
import { upload } from "../middleware/multerconfig.js";

const router = express.Router();

router.post("/createcategory",upload.single("catimage"),createcategory)
router.get("/getcategorylist",getcategory)
router.put("/updatecategorybyid/:id",upload.single("catimage"),updatecategory)
router.delete("/deletecategorybyid/:id",deletecategory)



export default router;