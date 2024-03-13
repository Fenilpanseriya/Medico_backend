import Patient from "../models/patient.model.js";
import ErrorHandler from "../utils/eroorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import { comparePassword } from "../utils/comparePassword.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto"
export const registerPatient=async(req,res,next)=>{
    try{
        const {name,email,password,birthDate,age,phoneNumber,gender,photo,patientAddress}=req.body;
        if(!name || !email || !password || !birthDate || !age || !phoneNumber || !gender || !photo || !patientAddress){
            return next(new ErrorHandler("please enter all fields "))
        }
        else{
           
            const response=await Patient.create({name,email,password,birthDate,age,phoneNumber,gender,photo,patientAddress})
            if(response){
                return sendToken(res,response,"Patient registration successfully",200,next)
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

export const loginPatient=async(req,res,next)=>{
    try{
        const {email,password}=req.body;
    
        if(!email ||!password){
            return next(new ErrorHandler("please enter all fields "))
        }
        let patient=await Patient.findOne({email}).select("+password")
        
        if(!patient){
            return next(new ErrorHandler("User is Not exist Exists please signup first...",401));
        }   
        const isMatch=await comparePassword(password,patient.password);
        if(!isMatch){
            return next(new ErrorHandler("Incorrect email/password...",401));
        }
        

        sendToken(res,patient,`welcome back ${patient.name}`,201);
    }
    catch(err){
        console.log("error in registration "+err.message)
    }

}
export const logoutPatient=async(req,res,next)=>{
    res.status(200).json({
        "success":true,
        "message":"Loggedout successfully.."
    })
}

export const patientForgetPassword=async(req,res,next)=>{
    try{
        const {email}=req.body;
        let user=await Patient.findOne({email})
    
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


export const patientResetPassword=async(req,res,next)=>{
    try{
        const {token}=req.params;
        console.log("token "+token);

        const resetPasswordToken=crypto.createHash('sha256').update(token).digest("hex");
        console.log("reset "+token,resetPasswordToken)

        const user=await Patient.findOne({resetPasswordToken:resetPasswordToken,resetPasswordExpire:{
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