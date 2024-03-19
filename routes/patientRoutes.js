import express from "express";
import { registerPatient,loginPatient, logoutPatient, patientForgetPassword, patientResetPassword, bookAppointment, checkSlot } from "../controllers/patientController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router=express.Router();


router.post("/register",registerPatient).post("/login",loginPatient)
router.get("/logoutPatient",logoutPatient).get("/checkslot",checkSlot);
router.post("/patientForgetPassword",patientForgetPassword).post("/patient/book-appointment",isAuthenticated,bookAppointment)
router.put("/patientResetPassword/:token",patientResetPassword)
export default router