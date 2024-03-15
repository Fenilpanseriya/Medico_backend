import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { doctorForgetPassword, doctorResetPassword, findAllDoctor, findDoctor, getDoctorById, loginDoctor, logoutDoctor, registerDoctor } from "../controllers/doctorController.js";

const router=express.Router();


router.post("/registerDoctor",registerDoctor).post("/loginDoctor",isAuthenticated,loginDoctor)
router.get("/logoutDoctor",logoutDoctor)
router.post("/doctorForgetPassword",doctorForgetPassword)
router.put("/doctorResetPassword/:token",doctorResetPassword)
router.get("/doctor",findDoctor).get("/doctor/profile/:id",getDoctorById).get("/getAllDoctors",findAllDoctor)
export default router