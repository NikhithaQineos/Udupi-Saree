import mongoose from "mongoose";
import { Admin } from "../Model/adminModel.js";

export const registration=async(req,res)=>{
    try{
  const admin=  new Admin(req.body);
  await admin.save();
  res.status(201).json({message:"admin created",admin});
    }catch(err)
    {
        res.status(400).json({message:"error creating admin"});
    }
}

export const login = async(req,res)=>{
    const{name,password} = req.body;
    if(!name || ! password){
      res.status(400).json({message:"name and password should be there"})
    }
    if(name=="admin" && password=="admin123"){
      res.status(201).json({message:"login sucessfull"})
    }else{
      res.status(400).json({message:"login failed"})
    }
}
