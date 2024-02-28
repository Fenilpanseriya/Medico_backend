import Patient from "../models/patient.model.js";
import ErrorHandler from "../utils/eroorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import { comparePassword } from "../utils/comparePassword.js";

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