import { Contact } from "../Model/contactusModel.js";

export const createContact = async(req,res)=>{
    try{
        const {name, phone, email, messege} = req.body;
        if(!name || !email || !phone || !messege){
            return res.status(400).json({messege:"all fields are required"})
        }
        const contact = new Contact(req.body);
        await contact.save();
        res.status(200).json({messege:"Contact us submitted succesfully",contact});
    }catch(error){
        res.status(400).json({messege:"failed to create contactus", error:error.messege});
    }
}

export const getContact = async(req,res)=>{
    try{
        const msg = await Contact.find().sort({createdAt:-1});
        res.status(200).json({messege:"contctus fetched", msg})
    }catch(error){
        res.status(400).json({messege:"failed to fetch contactus"})
    }
}

export const deleteMessege = async(req,res)=>{
    try{
        await Contact.findByIdAndDelete(req.params.id);
        res.status(200).json({messege:"deleted successfully"})
    }catch(error){
        res.status(400).json({messege:"failed to delete messege",error:error.messege})
    }
}