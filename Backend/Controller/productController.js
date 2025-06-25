import mongoose from "mongoose";
import { product } from "../Model/productModel.js";

export const createproduct = async (req, res) => {
  try {
    const {
      cat_id,
      productname,
      productdescription,
      productquantity,
      productgst,
      productcolor,
      productfabric,
      productprice,
    } = req.body;
    // Handle multiple images
    const productimages = req.files ? req.files.map((file) => file.filename) : [];

    const newproduct = new product({
      cat_id,
      productname,
      productdescription,
      productquantity,
      productgst,
      productprice,
      productcolor,
      productfabric,
      productimages, // Array of image filenames
    });

    await newproduct.save();
    res.status(201).json({ message: "Product created", newproduct });

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error creating product", error: error.message });
  }
};


export const getproduct = async (req, res) => {
  try {
      const { query } = req.query;
      let filter = {};
      if (query) {
        filter.productname = {$regex:`^${query}`,$options:'i'};
      }

    const products = await product.find(filter).populate('cat_id', 'catname');
    res.status(201).json({ message: "all products", products })
  } catch {
    res.status(400).json({ message: "couldnt get the product list" });
  }
}

export const getproductbyid = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await product.findById(id);
    res.status(201).json({ message: "product by id", products })

  } catch {
    res.status(400).json({ message: "product not found" })
  }
}

export const getproductbycatid = async (req,res)=>{
    try{
       const {cat_id} = req.params;
       const products = await product.find({cat_id});
       res.status(201).json({message:"products by category id",products})

    }catch{
        res.status(400).json({message:"products not found"})
    }
}

export const updateproduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { cat_id, productname, productdescription, productprice, productquantity, productgst,productfabric,productcolor} = req.body;
    const existingProduct = await product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Assign each field conditionally
    if (cat_id) existingProduct.cat_id = cat_id;
    if (productname) existingProduct.productname = productname;
    if (productdescription) existingProduct.productdescription = productdescription;
    if (productprice) existingProduct.productprice = productprice;
    if (productquantity) existingProduct.productquantity = productquantity;
    if (productgst) existingProduct.productgst = productgst;
    if (productcolor) existingProduct.productcolor = productcolor;
    if (productfabric) existingProduct.productfabric = productfabric;
    // Handle multiple images
    if (req.files && req.files.length > 0) {
      existingProduct.productimages = req.files.map(file => file.filename);
    }
    await existingProduct.save();
    res.status(200).json({ message: "Product updated", product: existingProduct });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: "Product cannot be updated", error: error.message });
  }
};

export const deleteproduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the product by ID
    const existingProduct = await product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2. Check quantity
    if (existingProduct.productquantity > 0) {
      return res.status(400).json({
        message: "Cannot delete product until stock is 0 or less",
      });
    }

    // 3. Delete product
    await product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(400).json({ message: "Product cannot be deleted", error: error.message });
  }
};


export const getFilters = async (req, res) => {
  try {
    const colors = await product.distinct("productcolor");
    const fabrics = await product.distinct("productfabric");

    res.status(200).json({ colors, fabrics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch filters" });
  }
};


export const getFilteredProducts = async (req, res) => {
  try {
    const { color, fabric } = req.query;
    const filter = {};

    if (color) filter.productcolor = color;
    if (fabric) filter.productfabric = fabric;

    const products = await product.find(filter);
    res.status(200).json({ message: "Filtered products", products });
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};
