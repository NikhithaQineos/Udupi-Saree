import mongoose from "mongoose";

const contactusSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    messege:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

export const Contact = mongoose.model("Contact",contactusSchema);