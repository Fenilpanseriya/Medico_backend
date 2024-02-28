import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import patient from "./routes/patientRoutes.js"
import doctor from "./routes/doctorRoutes.js"
import { connectDb } from "./config/connectDB.js";
dotenv.config();

connectDb();
const app=express();
app.listen(process.env.PORT,()=>{
    console.log("server started at port "+process.env.PORT)
})
app.use(express.json())
app.use(express.urlencoded({
    extended:true,
}))
const options={
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 204,
    
    
}

app.use(cookieParser());

app.use(cors({
    origin:"*",
    credentials:true,
    methods:["GET","DELETE","PUT","POST"]
    
}))

app.use("/api/v1",patient)
app.use("/api/v1",doctor)






export default app;