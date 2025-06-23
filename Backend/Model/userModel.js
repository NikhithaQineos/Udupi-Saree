import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    phone:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    resetCode: String,
    resetCodeExpiry: Date,
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
},
    {timestamps:true}
);

export const User = mongoose.model("User",userSchema);