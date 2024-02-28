import ErrorHandler from "../utils/eroorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import { comparePassword } from "../utils/comparePassword.js";
import Doctor from "../models/doctor.model.js";

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