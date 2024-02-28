import ErrorHandler from "../utils/eroorHandler.js";
import Patient from "../models/patient.model.js"
import jwt from "jsonwebtoken"
export const isAuthenticated = async (req, _, next) => {
  try {
    let token;
    if (req.headers.token) {
        token = req.headers.token;
    } 
    else if (req.params.token) {
        token = req.params.token;
    } 
    else {
        token = req.query.token;
    }
    console.log("token iss " + token);
    if (!token) {
        return next(new ErrorHandler("Not Logged in please login/signup"), 401);
    }
    const extracted = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Patient.findById(extracted._id);
    next();
  } 
  catch (err) {
    return next(new ErrorHandler("err is " + err, 400));
  }
};
