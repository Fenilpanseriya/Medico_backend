import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { loginDoctor, registerDoctor } from "../controllers/doctorController.js";

const router=express.Router();


router.post("/registerDoctor",registerDoctor).post("/loginDoctor",isAuthenticated,loginDoctor)
export default router