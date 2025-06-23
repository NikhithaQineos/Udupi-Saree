import mongoose from "mongoose";

const categoryschema = new mongoose.Schema({
    catname:{
        type:String,
        require:true
    },
    catdescription:{
        type:String,
        require:true
    },
    catimage:{
        type:String,
        required:true
    }
},
{timestamps:true}
);

export const category = new mongoose.model("category",categoryschema);