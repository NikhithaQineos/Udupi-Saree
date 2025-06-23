import express from "express";
import { createproduct,getproduct,getproductbyid,updateproduct,deleteproduct, getproductbycatid,getFilters,getFilteredProducts} from "../Controller/productController.js";
import { upload } from "../middleware/multerconfig.js";

const router = express.Router();

router.post("/createproduct",upload.array('productimages', 5),createproduct);
router.get("/getproduct",getproduct);
router.get("/getproductbyid/:id",getproductbyid);
router.get("/getproductbycatid/:cat_id",getproductbycatid);
router.put("/updateproduct/:id", upload.array("productimages", 5), updateproduct);
router.delete("/deleteproduct/:id",deleteproduct);
router.get("/getfilteredproducts", getFilteredProducts);
router.get("/getfilters", getFilters);




export default router;