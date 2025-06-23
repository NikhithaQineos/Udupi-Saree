import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
        cat_id: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "category",
        required : true
    },
       productname : {
        type:String,
        required:true
    },
        productimages : {
        type:[String],
        required:true
    },
        productprice : {
        type:Number,
        required:true
    },
        productdescription : {
        type:String,
        required:true
    },
        productquantity: {
        type: Number, 
        required: true
    },
        productgst: {
        type: Number, 
        required: true
    },
    productcolor: {
        type: String, 
    },
        productfabric:{
        type: String,
    },
         offer: {
        offerpercentage: { type: Number, required: false },
        validTill: { type: Date, default: null }
    }
},
    {timestamps:true}
);

export const product = new mongoose.model("product",productSchema);