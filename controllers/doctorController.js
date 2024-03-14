import ErrorHandler from "../utils/eroorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import { comparePassword } from "../utils/comparePassword.js";
import Doctor from "../models/doctor.model.js";
import mongoose from "mongoose";
import {ObjectId}from "mongoose";

export const registerDoctor=async(req,res,next)=>{
    try{
        const {name,email,password,birthDate,age,phoneNumber,gender,photo,experience,doctorAddress,doctorDegree,fees }=req.body;
        if(!name || !email || !password || !birthDate || !age || !phoneNumber || !gender || !photo || !doctorAddress || !doctorDegree){
            return next(new ErrorHandler("please enter all fields "))
        }
        else{
           const patient=await Doctor.create({name,email,password,birthDate,age,phoneNumber,gender,photo,doctorAddress,experience,doctorDegree,fees})
            if(patient){
                return sendToken(res,patient,"Doctror registration successfully",200,next)
            }
            else{
                return next(new ErrorHandler("please try again. something went wrong"),400)
            }
        }

    }
    catch(err){
        console.log("error in registration "+err.message)
    }

}

export const loginDoctor=async(req,res,next)=>{
    try{
        const {email,password}=req.body;
    
        if(!email ||!password){
            return next(new ErrorHandler("please enter all fields "))
        }
        let doctor=await Doctor.findOne({email}).select("+password")
        
        if(!doctor){
            return next(new ErrorHandler("Doctor is Not Exists please signup first...",401));
        }   
        const isMatch=await comparePassword(password,doctor.password);
        if(!isMatch){
            return next(new ErrorHandler("Incorrect email/password...",401));
        }
        

        sendToken(res,doctor,`welcome back ${doctor.name}`,201);
    }
    catch(err){
        console.log("error in login "+err.message)
    }

}
export const logoutDoctor=async(req,res,next)=>{
    res.status(200).json({
        "success":true,
        "message":"Loggedout successfully.."
    })
}

export const doctorForgetPassword=async(req,res,next)=>{
    try{
        const {email}=req.body;
        let user=await Doctor.findOne({email})
    
        if(!user){
            return next(new ErrorHandler("doctor not found",400));
        }
    
        const resetToken=await user.getResetToken();
        await user.save(); 
    
        const url=`${process.env.FRONTEND_URI}/resetpassword/${resetToken}`
        const message=`Click on the link to reset your paassword .${url}. if you have not request than Please ignore`
    
        await sendEmail(user.email,"Learnyard Reset password",message)
    
        res.status(200).json({
            "success":true,
            "message":`Resert link sent on ${email}`,
            "resetToken":resetToken
        })

    }
    catch(err){
        res.status(401).json({
            "success":false,
            "message":err.message,

        })
    }
    
}


export const doctorResetPassword=async(req,res,next)=>{
    try{
        const {token}=req.params;
        console.log("token "+token);

        const resetPasswordToken=crypto.createHash('sha256').update(token).digest("hex");
        console.log("reset "+token,resetPasswordToken)

        const user=await Doctor.findOne({resetPasswordToken:resetPasswordToken,resetPasswordExpire:{
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

export const findDoctor=async(req,res,next)=>{
    try {
        console.log("----"+req.body.location)
        const location= req.query.location?req.query.location:"";
        const degree= req.query.degree?req.query.degree:"";
        console.log(location,degree)
        const locationRegex = new RegExp(location, 'i'); 
        const degreeRegex = new RegExp(degree, 'i');
        let response;
        if(location && degree){
            response=await Doctor.find({
                $and:[
                    {doctorAddress: locationRegex},
                    { doctorDegree: { $in: [degreeRegex] } }
                    
                ]
            }).select("-password");
            console.log(response)
        }
        else if(location){
            response=await Doctor.find({ doctorAddress: locationRegex }).select("-password");
            console.log(response)
        }
        else{
            response=await Doctor.find({ doctorDegree: { $in: [degreeRegex] } }).select("-password");
            console.log(response)
        }
        
        return res.status(200).json({
            success:true,
            doctors:response
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            "message":error.message
        })
    }
}

export  const getDoctorById=async(req,res)=>{
    try {
        let id=req.params.id;
        console.log(typeof id);
        
        const doctor= await Doctor.findById(id);
        res.status(200).json({
            success:true,
            doctor
        })
        
    } catch (error) {
        res.status(400).json(error.message)
    }
}

export const addPatientReport=async(req,res)=>{
   
}