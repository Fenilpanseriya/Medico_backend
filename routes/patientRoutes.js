import express from "express";
import { registerPatient,loginPatient } from "../controllers/patientController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router=express.Router();


router.post("/register",registerPatient).post("/login",isAuthenticated,loginPatient)
export default router