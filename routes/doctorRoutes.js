import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { doctorForgetPassword, doctorResetPassword, doneAppointment, fetchTodaysAppointment, findAllDoctor, findDoctor, getDoctorById, loginDoctor, logoutDoctor, registerDoctor } from "../controllers/doctorController.js";

const router=express.Router();


router.post("/registerDoctor",registerDoctor).post("/loginDoctor",loginDoctor)
router.get("/logoutDoctor",logoutDoctor).get("/todays-appointment",isAuthenticated,fetchTodaysAppointment)
router.post("/doctorForgetPassword",doctorForgetPassword).post("/done-appointment",isAuthenticated,doneAppointment)
router.put("/doctorResetPassword/:token",doctorResetPassword)
router.get("/doctor",findDoctor).get("/doctor/profile/:id",getDoctorById).get("/getAllDoctors",findAllDoctor)
export default router