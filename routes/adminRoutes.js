import express from "express";
import { addHospital } from "../controllers/adminController.js";

const router=express.Router();


router.post("/add-hospital",addHospital)
export default router