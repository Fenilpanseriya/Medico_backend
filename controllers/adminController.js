import Admin from "../models/admin.model.js";
import Hospital from "../models/hospital.model.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/eroorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "cloudinary"

export const addHospital=async(req,res)=>{
    const {hospitalName,hospitalAddress,diseaseSpecialist}=req.body;
    console.log(hospitalName,hospitalAddress,diseaseSpecialist)
    if(!hospitalName || !hospitalAddress || !diseaseSpecialist){
        return res.status(400).json({message:"Please fill all fields"});
    }
    else{
        try {
            let diseaes= diseaseSpecialist.map((item)=>item.value)
            console.log(diseaes)
            const hospital=await Hospital.create({hospitalName,hospitalAddress,diseaseSpecialist:diseaes})
            if(hospital){
                return res.status(200).json({
                    message:"added successfully",
                    hospital
                })
            }
            
        } catch (error) {
            return res.status(400).json({
                message:error.message
            })
        }
        
    }
}


export const registerAdmin=async(req,res,next)=>{
    try {
        console.log("in admin")
        const {name,email,password,birthDate,age,phoneNumber,gender,address}=req.body;
        const file=req.file;
        const fileUri=getDataUri(file,next);
        //console.log(fileUri);
        const {public_id,secure_url}=await cloudinary.v2.uploader.upload(fileUri?.content,{
            resource_type:"auto"
        });
        //console.log("public id"+public_id)
        const response=await Admin.create({photo:{public_id,url:secure_url},name,email,password,birthDate,age,phoneNumber,gender,adminAddress:address})
        if(response){
            return sendToken(res,response,"Admin registration successfully",200,next)
        }
        else{
            return next(new ErrorHandler("please try again. something went wrong"),400)
        }
    } catch (error) {
        return res.status(400).json({
            message:error.message
        })
    }
}

export const adminResetPassword=async(req,res,next)=>{
    try{
        const {token}=req.params;
        console.log("token "+token);

        const resetPasswordToken=crypto.createHash('sha256').update(token).digest("hex");
        console.log("reset "+token,resetPasswordToken)

        const user=await Admin.findOne({resetPasswordToken:resetPasswordToken,resetPasswordExpire:{
            $gt:Date.now()
        }})
    
        if(!user){
            return next(new ErrorHandler("token is invalid/has been expired"),400);
        }   
        user.password=req.body.password;
        user.resetPasswordExpire=undefined;
        user.resetPasswordToken=undefined;
        await user.save();

        res.status(200).json({
            "success":true,
            "message":"password updated  successfully"
        })

    }
    catch(err){
        res.status(401).json({
            "success":false,
            "message":err.message
        })
    }
    
}

export const addMedicine=async(req,res)=>{
    try {
        const {medicine,stockOfMedicine,hospitalName}=req.body;
        const hospital=await Hospital.findOne({hospitalName})
        if(!hospital){
            return res.status(400).json({
                message:"hospital not found"
            })
        }
        if(!hospital.medicine){
            hospital.medicine=new Map();
        }
        if(!hospital.medicine.has(medicine)){
            hospital.medicine.set(medicine,stockOfMedicine)
        }
        else{
            hospital.medicine.set(medicine,Number(hospital.medicine.get(medicine))+Number(stockOfMedicine))
        }
        await hospital.save();

        return res.status(200).json({
            message:"medicine added successfully",
            hospital
        })

    } catch (error) {
        res.status(401).json({
            "success":false,
            "message":error.message
        })
    }
}