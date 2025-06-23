import mongoose from "mongoose";
import { category } from "../Model/categoryModel.js";

export const createcategory = async (req, res) => {
    try {
        const { catname, catdescription } = req.body;
        const catimage = req.file ? req.file.filename : null;
        const newcategory = new category({ catname, catdescription, catimage });
        await newcategory.save();
        res.status(201).json({ message: "category created", newcategory })
    } catch (err) {
        res.status(400).json({ message: "error creating category" })
    }
}

export const getcategory = async (req, res) => {
    try {
        const newgetcategory = await category.find();
        res.status(201).json({ message: "all category", newgetcategory })
    } catch (err) {
        res.status(400).json({ message: "error no category" })
    }
}

export const updatecategory = async (req, res) => {
    console.log("Updating category...");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    try {
        const catid = req.params.id;
        const existingCat = await category.findById(catid);
    if (!existingCat) {
      return res.status(404).json({ message: "Category doesn't exist" });
    }
    if (req.body.catname) existingCat.catname = req.body.catname;
    if (req.body.catdescription) existingCat.catdescription = req.body.catdescription;
    if (req.file) existingCat.catimage = req.file.filename;
    await existingCat.save();
    res.status(200).json({ message: "Category updated", category: existingCat });
  } catch (err) {
    console.error("Category update error:", err);
    res.status(500).json({ message: "Category cannot be updated" });
  }
};

export const deletecategory = async (req, res) => {
    try {
        const catid = req.params.id;
        // Check for valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(catid)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }
        const deletedCategory = await category.findByIdAndDelete(catid);

        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
