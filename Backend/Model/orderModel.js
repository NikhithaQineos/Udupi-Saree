import mongoose, { MongooseError } from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        username:{
            type:String,
            required:true
        },
        userphone:{
            type:String,
            required:true
        },
        paymentMode:{
            type:String,
            enum:["cash on delivery","Razorpay"],
            required:true
        },
        paymentId:{
            type:String,
            default:""
        },
        shippingAddress:{
            house:{
                type:String,
                required:true
            },
            area:{
                type:String,
                required:true
            },
            landmark:{
                type:String,
                required:true
            }
        },
        total:{
            type:String,
            required:true
        },
        status: {
            type: String,
            enum: ["placed", "cancelled", "delivered"],
            default: "placed"
            },
        items:[
            {
                _id:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"product"
                },
                productname:{type:String,required:true},
                productprice:{type:String,required:true},
                productgst:{type:String,required:true},
                productquantity:{type:Number,required:true},
                offer: {
                    offerType: { type: String, enum: ["percentage", "rupees"], default: null },
                    offerValue: { type: Number, default: null },
                    validTill: { type: Date, default: null }
                },
            }
        ]
},
{timestamps:true}
);

export const order = mongoose.model("order",orderSchema);