import { Offer } from "../Model/offerModel.js";
import { category } from "../Model/categoryModel.js";
import { product } from "../Model/productModel.js";

export const createOffer = async (req, res) => {
  try {
    const { targetType, targetIds, offerType, offerValue, validTill } = req.body;

    if (!targetType || !offerType || !offerValue || !validTill || !targetIds) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const today = new Date();

    // Auto-remove expired offers before checking
    await Offer.deleteMany({ validTill: { $lt: today } });

    // Case: Apply to ALL products
    if (targetType === "product" && targetIds === "all") {
      const existing = await Offer.findOne({
        targetType: "product",
        targetIds: { $size: await product.countDocuments() },
        validTill: { $gte: today }
      });

      if (existing) {
        return res.status(400).json({ message: "An offer is already running for all products" });
      }

      const allProducts = await product.find();
      const allIds = allProducts.map((p) => p._id);

      const newOffer = new Offer({
        targetType,
        targetIds: allIds,
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

    // ✅ Check for duplicate offers on individual IDs (category or product)
    const existing = await Offer.findOne({
      targetType,
      targetIds: { $in: targetIds },
      validTill: { $gte: today },
    });

    if (existing) {
      return res.status(400).json({
        message:` An offer is already running for one or more selected ${targetType}s.`,
      });
    }

    // Create the offer
    const newOffer = new Offer({
      targetType,
      targetIds,
      offerType,
      offerValue,
      validTill,
    });

    await newOffer.save();
    res.status(201).json({ success: true, offers: [newOffer] });
  } catch (err) {
    console.error("Offer creation failed:", err);
    res.status(500).json({ message: "Server error during offer creation" });
  }
};



// export const getOffers = async (req, res) => {
//   try {
//     const offers = await Offer.find();

//     const enrichedOffers = await Promise.all(
//       offers.map(async (offer) => {
//         let targetNames = [];

//         if (offer.targetType === "product") {
//           const productsList = await product.find({ _id: { $in: offer.targetIds } });
//           targetNames = productsList.map((p) => p.productname);
//         } else if (offer.targetType === "category") {
//           const categoriesList = await category.find({ _id: { $in: offer.targetIds } });
//           targetNames = categoriesList.map((c) => c.catname);
//         }

//         return {
//           ...offer._doc,
//           targetNames,
//         };
//       })
//     );

//     res.status(200).json({ success: true, offers: enrichedOffers });
//   } catch (error) {
//     console.error("Error fetching offers:", error);
//     res.status(500).json({ success: false, message: "Error fetching offers" });
//   }
// };

export const getOffers = async (req, res) => {
  try {
    const today = new Date();

    // Auto-delete expired offers
    await Offer.deleteMany({ validTill: { $lt: today } });

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
    console.log("➡️ Delete request received for ID:", id);

    const deleted = await Offer.findByIdAndDelete(id);

    if (!deleted) {
      console.log("❌ Offer not found with ID:", id);
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    console.log("✅ Offer deleted:", deleted._id);
    res.status(200).json({ success: true, message: "Offer deleted" });
  } catch (err) {
    console.error("🔥 Delete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};