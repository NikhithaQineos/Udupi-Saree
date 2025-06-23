import { Address } from "../Model/addressModel.js";

export const createAddress = async(req,res)=> {
    try{
        const {userId, pincode, address,city,state,landmark,alternatePhone,addressType} =req.body;
        //check for duplicates
        const existingAddress = await Address.findOne({userId, pincode, address, city, state, landmark, alternatePhone, addressType});
        if(existingAddress){
            return res.status(400).json({messege:"address already exists for this user."});
        }
        const newAddress = new Address(req.body);
        await newAddress.save();
        res.status(200).json({messege:"Address saved sucessfully", newAddress});
    }catch(error){
        res.status(400).json({messege:"failed to save address", error:error.messege})
    }
}

export const addressById = async(req,res)=>{
    try{
        const {userId}  = req.params;
        const add= await Address.find({ userId });
        res.status(200).json({messege:"Fetched Address",add})
    }catch(error){
        res.status(400).json({messege:"Failed to fetch address", error:error.messege})
    }
}

export const updateAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const updateData = req.body;
    // Check if address exists for the given user
    const existingAddress = await Address.findOne({ _id: addressId, userId });
    if (!existingAddress) {
      return res.status(404).json({ message: "Address not found for this user." });
    }
    // Update the address
    const updatedAddress = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      updateData,
      { new: true }
    );
    res.status(200).json({ message: "Address updated successfully", updatedAddress });
  } catch (error) {
    res.status(400).json({ message: "Failed to update address", error: error.message });
  }
};



export const deleteAddress = async(req,res)=>{
    try{
        const { userId, addressId } = req.params;
        await Address.deleteOne({_id:addressId, userId})
        res.status(200).json({ message: "Address deleted successfully" });
    }catch(error){
        res.status(400).json({messege:"failed to delete address",error:error.messege});
    }
}