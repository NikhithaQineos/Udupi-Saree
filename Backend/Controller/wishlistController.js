import { User } from "../Model/userModel.js";
import { product } from "../Model/productModel.js";

export const addremoveWishlist = async(req,res)=>{
    const { userId, productId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
    }
    await user.save();
    res.status(200).json({ message: "Wishlist updated", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error updating wishlist", error });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error });
  }
};

export const deleteWishlist = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { wishlist: [] },
      { new: true }
    );
    res.status(200).json({ message: "Wishlist cleared", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error clearing wishlist", error });
  }
};