import { Offer } from "../Model/offerModel.js";
import { category } from "../Model/categoryModel.js";
import { product } from "../Model/productModel.js";

export const createOffer = async (req, res) => {
  try {
    const { targetType, targetIds, offerType, offerValue, validFrom, validTill } = req.body;

    if (!targetType || !offerType || !offerValue || !validFrom || !validTill || !targetIds || targetIds.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new Date(validFrom) > new Date(validTill)) {
      return res.status(400).json({ message: "Valid From date must be before Valid Till date." });
    }


    const today = new Date();

    // Auto-remove expired offers
    await Offer.deleteMany({ validTill: { $lt: today } });

    // Prevent duplicate offers on selected target IDs
    const existing = await Offer.findOne({
      targetType,
      targetIds: { $in: targetIds },
      $and: [
        { validFrom: { $lte: new Date(validTill) } },
        { validTill: { $gte: new Date(validFrom) } },
      ],
    });


    if (existing) {
      return res.status(400).json({
        message: `An offer is already running for one or more selected ${targetType}s.`,
      });
    }

    const newOffer = new Offer({
      targetType,
      targetIds,
      offerType,
      offerValue,
      validFrom: new Date(validFrom),
      validTill: new Date(validTill),
    });

    if (isNaN(new Date(validFrom)) || isNaN(new Date(validTill))) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    await newOffer.save();
    res.status(201).json({ success: true, offers: [newOffer] });
  } catch (err) {
    console.error("Offer creation failed:", err);
    res.status(500).json({ message: "Server error during offer creation" });
  }
};


export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find(); // 🔁 fetch ALL offers
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

    const deleted = await Offer.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    res.status(200).json({ success: true, message: "Offer deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};