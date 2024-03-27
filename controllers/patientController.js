import Patient from "../models/patient.model.js";
import ErrorHandler from "../utils/eroorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import { comparePassword } from "../utils/comparePassword.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto"
import Doctor from "../models/doctor.model.js";
import mongoose from "mongoose";
export const registerPatient=async(req,res,next)=>{
    try{
        const {name,email,password,birthDate,age,phoneNumber,gender,avatar,address}=req.body;
        console.log(name,email,password,birthDate,age,phoneNumber,gender,address)
        if(!name || !email || !password || !birthDate || !age || !phoneNumber || !gender || !avatar || !address){
            return next(new ErrorHandler("please enter all fields "))
        }
        else{
            let photo={
                public_id:"temp",
                url:"temp"
            }
            const response=await Patient.create({name,email,password,birthDate,age,phoneNumber,gender,photo,patientAddress:address})
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
        

        sendToken(res,patient,`welcome back ${patient.name}`,200);
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

export const bookAppointment=async(req,res)=>{
    try {
        const {email,phoneNumber,id,time,date}=req.body;
        console.log(email,phoneNumber,id,date);
        if(!email || !phoneNumber ||!id  || !date){
            throw new ErrorHandler("please provide all fields",400);  
        }
        const patient=await  Patient.findOne({email,phoneNumber});
        if(!patient){
            return next(new ErrorHandler("Patient not found.Please enter correct email id"),400);
        }
        
        let len=patient.diseases?.length

        if(len===1){
            patient.diseases[len-1]={...patient.diseases[len-1],doctor:id,appointmentDate:date,appointmentTime:time}
            patient.diseases[len]={};
        }
        else{
            
            patient.diseases[len-1]={doctor:id,appointmentDate:date,appointmentTime:time}
            patient.diseases[len]={};
        }
        
        await patient.save();

        const doctor=await Doctor.findById(id)
        await doctor.appointmentList.push(patient._id);

        if (!doctor.appointmentSlots.has(date)) {
            doctor.appointmentSlots.set(date, []);
        }
        // Add the time slot to the array for the given date
        doctor.appointmentSlots.get(date).push(time);
        doctor.save(); 

        res.status(200).json({
            success:true,
            patient,
            doctor
        })
    } 
    catch (error) {
        console.log(error)
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
    


}
        
export const checkSlot=async(req,res)=>{
    try {
        const time=req.query.time;
        const date=req.query.date;
        const id=req.query.id;
        console.log(time,date,id)
        let doctor=await Doctor.findById(id);
        if(!doctor){
            return res.status(400).json({
                available: false,
                message:"invalid doctor"
            });
        }
        let slots = doctor.appointmentSlots.get(date);
        if(slots && slots.includes(time)){
            return res.status(200).json({
                availabel:false,
                message:"this slot is not availabel"
            })
        }
        else{
            return res.status(200).json({
                availabel:true,
            })
        }
    } 
    catch (error) {
        return res.status(400).json({
            available: false,
            message: error.message
        });
    }
}
 let idToDoctorName=new Map();
export const getAllAppointments=async(req,res)=>{
    try {
        let patient=await Patient.findById(req.user);
        if(!patient){
            throw new ErrorHandler("Invalid Patient",400);  
        }
        let appointments = await Promise.all(patient?.diseases?.map(async (item) => {
            if (idToDoctorName.has(item.doctor)) {
                console.log("in cache");
                return { ...item, doctor: idToDoctorName[item.doctor] };
            } else {
                let doctorName = await Doctor.findById(item.doctor)
                idToDoctorName[item.doctor] = doctorName?.name;
                return { ...item, doctor: doctorName?.name };
            }
        }));
        
        console.log(appointments);
        appointments=appointments.slice(0,appointments.length-1)
        return res.status(200).json({
            success:true,
            count:appointments.length,
            appointments
        })
    } 
    catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

export const getUserInfo=async(req,res)=>{
    try {
        const user=await Patient.findById(req.user);
        if(!user){
            throw new ErrorHandler("user not found",400);  
        }
        let info={email:user.email,name:user.name,phoneNumber:user.phoneNumber,gender:user.gender,patientAddress:user.patientAddress,birthDate:user.birthDate};
        return res.status(200).json({
            success: true,
            info
        })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

