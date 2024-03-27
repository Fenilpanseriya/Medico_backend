import express from "express";
import { registerPatient,loginPatient, logoutPatient, patientForgetPassword, patientResetPassword, bookAppointment, checkSlot, getAllAppointments, getUserInfo } from "../controllers/patientController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router=express.Router();


router.post("/register",registerPatient).post("/login",loginPatient)
router.get("/get-profile-info",isAuthenticated,getUserInfo)
router.get("/logoutPatient",logoutPatient).get("/checkslot",checkSlot).get("/total-appointments",isAuthenticated,getAllAppointments);
router.post("/patientForgetPassword",patientForgetPassword).post("/patient/book-appointment",isAuthenticated,bookAppointment)
router.put("/patientResetPassword/:token",patientResetPassword)
export default router