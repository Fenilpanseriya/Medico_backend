import express from "express";
import { registerPatient,loginPatient, logoutPatient, patientForgetPassword, patientResetPassword, bookAppointment, checkSlot, getAllAppointments, getUserInfo, updateProfile, changeProfile } from "../controllers/patientController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../utils/multer.js";

const router=express.Router();


router.post("/register",singleUpload,registerPatient).post("/login",loginPatient)
router.get("/get-profile-info",isAuthenticated,getUserInfo)
router.get("/logoutPatient",logoutPatient).get("/checkslot",checkSlot).get("/total-appointments",isAuthenticated,getAllAppointments);
router.post("/patientForgetPassword",patientForgetPassword).post("/patient/book-appointment",isAuthenticated,bookAppointment)
router.put("/patientResetPassword/:token",patientResetPassword).put("/update-profile",isAuthenticated,updateProfile).put("/change-profile",isAuthenticated,singleUpload,changeProfile);
export default router