import ErrorHandler from "../utils/eroorHandler.js";
import Patient from "../models/patient.model.js"
import jwt from "jsonwebtoken"
import Doctor from "../models/doctor.model.js";
import Admin from "../models/admin.model.js";
export const isAuthenticated = async (req, _, next) => {
  try {
    // if(req.method==="POST"){
    //   console.log(req.body);
    // }
    let token;
    if (req.headers.token) {
        token = req.headers.token;
    } 
    else if(req.cookies.token){
      console.log("fetch cookie")
      token=req.cookies.token
    }
    else if (req.params.token) {
        token = req.params.token;
    } 
    else  {
        token = req.query.token;
    }
    console.log("token iss " + token);
    if (!token) {
        return next(new ErrorHandler("Not Logged in please login/signup"), 401);
    }
    const extracted = jwt.verify(token, process.env.JWT_SECRET);
    console.log("role is "+req.query.role)
    if(req.query.role==="user"){
      req.user = await Patient.findById(extracted._id) ;
    }
    else if(req.query.role==="doctor"){
      req.user = await Doctor.findById(extracted._id) ;
    }
    else if(req.query.role==="admin"){
      req.user = await Admin.findById(extracted._id) ;
    }
    
    next();
  } 
  catch (err) {
    return next(new ErrorHandler("err is " + err, 400));
  }
};
