import ErrorHandler from "../utils/eroorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import { comparePassword } from "../utils/comparePassword.js";
import Doctor from "../models/doctor.model.js";
import mongoose from "mongoose";
import {ObjectId}from "mongoose";
import Hospital from "../models/hospital.model.js";
import Patient from "../models/patient.model.js";

export const registerDoctor=async(req,res,next)=>{
    try{
        const {name,email,password,birthDate,age,phoneNumber,gender,photo,experience,doctorAddress,doctorDegree,fees ,hospitalName}=req.body;
        if(!name || !email || !password || !birthDate || !age || !phoneNumber || !gender || !photo || !doctorAddress || !doctorDegree || !hospitalName){
            return next(new ErrorHandler("please enter all fields "))
        }
        else{
            const doctor=await Doctor.create({name,email,password,birthDate,age,phoneNumber,gender,photo,doctorAddress,experience,doctorDegree,fees})

            if(doctor){
                hospitalName?.forEach((hospital=>{

                    (async()=>{
                        const {_id}=await Hospital.findOne({hospitalName:hospital})
                        await doctor.hospitalName.push(_id)
                        await doctor.save();
                    })()
                    
                }))
                
                return sendToken(res,doctor,"Doctror registration successfully",200,next)
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

export const  findAllDoctor=async(_,res)=>{
    const response1=await Doctor.find({})
    return res.status(200).json({
        success:true,
        doctors:response1,
        message:"not found",
    })
}

export const findDoctor=async(req,res,next)=>{
    try {
        console.log("----"+req.query.location)
        const location= req.query.location?req.query.location:"none";
        const degree= req.query.degree?req.query.degree:"none";
        console.log(location,degree)
        console.log(typeof location)
        if(typeof location==="undefined"  && typeof degree==="undefined"){
            
        }
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

export const  fetchTodaysAppointment=async(req,res)=>{
    try {
        const date=req.query.date;
        //console.log(date)
        if(!date){
            return next(new ErrorHandler("please enter date"))
        }
        //console.log("user is "+req.user)
        let doctor=await Doctor.findById(req.user);
        //console.log(doctor)

        let len=doctor?.appointmentSlots[date]?.length
        let totalAppointment=doctor?.appointmentList?.length
        let countOfTodaysAppointment=totalAppointment-len;
        let todaysAppointment=doctor?.appointmentList?.slice(countOfTodaysAppointment,len)
        //console.log(todaysAppointment)

        let appointmentData=[];
        
        for(let i=0;i<todaysAppointment.length;i++){
            let data={};
            let patient=await Patient.findById(todaysAppointment[i]);
            let len=patient?.diseases?.length;
            data["name"]=patient.name;
            data["appointmentDate"]=patient.diseases[len-2].appointmentDate
            data["appointmentTime"]=patient.diseases[len-2].appointmentTime
            data["diseasesName"]="";
            data["caseFees"]=0;
            data["medicines"]=""
            data["nextVisitTime"]=new Date(Date.now()).toDateString()
            appointmentData.push(data)
        }

        console.log(appointmentData)

        return res.status(200).json({
            appointmentData,
            success:true
        })
    } 
    catch (error) {
        res.status(400).json(error.message)
    }
}