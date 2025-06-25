import mongoose from "mongoose";
import { order } from "../Model/orderModel.js";
import { product } from "../Model/productModel.js";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      userId,
      username,
      userphone,
      paymentMode,
      paymentId,
      shippingAddress,
      total,
      items,
    } = req.body;

    const mappedItems = items.map((item) => ({
      _id: item._id,
      productname: item.productname,
      productprice: item.productprice,
      productgst: item.productgst,
      productquantity: item.productquantity,
      offer: item.offer
        ? {
          offerType: item.offer.offerType ?? null,
          offerValue: item.offer.offerValue ?? null,
          validTill: item.offer.validTill ?? null,
        }
        : null,
    }));

    const newOrder = new order({
      userId,
      username,
      userphone,
      paymentMode,
      paymentId,
      shippingAddress,
      total,
      items: mappedItems,
    });

    // Loop to update stock
    for (const item of items) {
      const prod = await product.findById(item._id).session(session);
      if (!prod) throw new Error(`Product with ID ${item._id} not found`);

      const orderedQty = parseInt(item.productquantity);
      if (prod.productquantity < orderedQty) {
        throw new Error(`Insufficient quantity for product: ${prod.productname}`);
      }

      prod.productquantity -= orderedQty;
      await prod.save({ session });
    }

    await newOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Order placed successfully", newOrder });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Order creation failed:", error);
    res.status(400).json({ message: "Failed to create order", error: error.message });
  }
};

export const getOrder = async(req,res)=>{
    try{
        const orders = await order.find();
        res.status(201).json({message:"fetched orders",orders});
    }catch(error){
        console.error("fetching error orders",error);
        res.status(400).json({message:"failed to fetch orders"});
    }
}

export const getOrdersByUserId = async (req,res) =>{
    try{
         const { id } = req.params;
        const orders = await order.find({ userId: id });
        res.status(201).json({message:"orders",orders})
    }catch(error){
        console.error("error fetching ordder",error)
        res.status(400).json({message:"failed to fetch order "})
    }
}

export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingOrder = await order.findById(id).session(session);
    if (!existingOrder) {
      throw new Error("Order not found");
    }

    // Only proceed if not already cancelled
    if (existingOrder.status === "cancelled") {
      throw new Error("Order is already cancelled");
    }

    // Restore stock for each item
    for (const item of existingOrder.items) {
      const prod = await product.findById(item._id).session(session);
      if (!prod) {
        throw new Error(`Product with ID ${item._id} not found`);
      }

      prod.productquantity += parseInt(item.productquantity); // restore stock
      await prod.save({ session });
    }

    // Update the order status
    existingOrder.status = "cancelled";
    const updatedOrder = await existingOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Order cancelled and stock restored", updatedOrder });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Order cancel failed:", error);
    res.status(400).json({ message: "Failed to cancel order", error: error.message });
  }
};

export const orderasdelivered = async(req ,res)=>{
    const {id} = req.params;
    try{
        const updatedorder = await order.findByIdAndUpdate(id,{status:"delivered"},{new:true})
        res.status(201).json({message:"orders updated",updatedorder})
    }catch{
         res.status(400).json({message:"failed to delivery order "})
    }
}

