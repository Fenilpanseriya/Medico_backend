import express from "express";
import { addHospital, addMedicine, adminResetPassword, registerAdmin } from "../controllers/adminController.js";
import singleUpload from "../utils/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router=express.Router();


router.post("/add-hospital",addHospital).post("/register",singleUpload,registerAdmin).post("/add-medicine",isAuthenticated,addMedicine)
router.put("/reset-password",isAuthenticated,adminResetPassword)
export default router