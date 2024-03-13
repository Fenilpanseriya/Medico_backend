import express from "express";
import { registerPatient,loginPatient, logoutPatient, patientForgetPassword, patientResetPassword } from "../controllers/patientController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router=express.Router();


router.post("/register",registerPatient).post("/login",isAuthenticated,loginPatient)
router.get("/logoutPatient",logoutPatient)
router.post("/patientForgetPassword",patientForgetPassword)
router.put("/patientResetPassword/:token",patientResetPassword)
export default router