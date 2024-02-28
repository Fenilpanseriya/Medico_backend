import ErrorHandler from "./eroorHandler.js"
import jwt from "jsonwebtoken"



export const sendToken=async(res,user,message,statusCode,next)=>{
console.log("in sendtoken")
const token=await getJWTToken(user._id)
const options={
    expires:new Date(Date.now()+15*24*60*60*1000),
    httpOnly:true,
    sameSite:"none"
}
    if(token){
        try{
            console.log("token in sendtoken "+token)
            console.log("user is  "+user)
            res.status(statusCode).cookie("token",token,options).json({
                success:true,
                message,
                user,token
            })

        }
        catch(e){
            return next(new ErrorHandler("creation fail in sendtoken function"),400)
        }

    }
    else{
        return next(new ErrorHandler("creation fail due to token is not get"),400)
    }
    
}
function getJWTToken(id){
    return jwt.sign({_id:id},process.env.JWT_SECRET,{
        expiresIn:"15d"
    })
}