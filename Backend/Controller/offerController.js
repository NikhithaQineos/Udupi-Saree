import { Offer } from "../Model/offerModel.js";
import { category } from "../Model/categoryModel.js";
import { product } from "../Model/productModel.js";

export const createOffer = async (req, res) => {
  try {
    const { targetType, targetIds, offerType, offerValue, validTill } = req.body;

    if (!targetType || !offerType || !offerValue || !validTill || !targetIds) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let createdOffers = [];

    // Special case: apply to all products
    if (targetType === "product" && targetIds === "all") {
      const allProducts = await product.find();
      const allIds = allProducts.map((p) => p._id);

      const newOffer = new Offer({
        targetType,
        targetIds: allIds,  // ✅ Correct field
        offerType,
        offerValue,
        validTill,
      });

      await newOffer.save();
      return res.status(201).json({
        success: true,
        message: "Offer applied to all products",
        offers: [newOffer],
      });
    }

    // ✅ For multiple selected category/product IDs
    const newOffer = new Offer({
      targetType,
      targetIds: targetIds,  // array of IDs
      offerType,
      offerValue,
      validTill,
    });

    await newOffer.save();
    createdOffers.push(newOffer);

    res.status(201).json({ success: true, offers: createdOffers });
  } catch (err) {
    console.error("Offer creation failed:", err);
    res.status(500).json({ message: "Server error during offer creation" });
  }
};


export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find();

    const enrichedOffers = await Promise.all(
      offers.map(async (offer) => {
        let targetNames = [];

        if (offer.targetType === "product") {
          const productsList = await product.find({ _id: { $in: offer.targetIds } });
          targetNames = productsList.map((p) => p.productname);
        } else if (offer.targetType === "category") {
          const categoriesList = await category.find({ _id: { $in: offer.targetIds } });
          targetNames = categoriesList.map((c) => c.catname);
        }

        return {
          ...offer._doc,
          targetNames,
        };
      })
    );

    res.status(200).json({ success: true, offers: enrichedOffers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ success: false, message: "Error fetching offers" });
  }
};


export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    await Offer.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Offer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};