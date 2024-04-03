import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { createServer } from 'http';
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import patient from "./routes/patientRoutes.js"
import doctor from "./routes/doctorRoutes.js"
import admin from "./routes/adminRoutes.js"
import { connectDb } from "./config/connectDB.js";
import { Server } from "socket.io"
dotenv.config();

connectDb();
const app = express();

const io = new Server();

let emailToSocketMap=new Map()
let socketToEmailMap=new Map()
io.on("connection",(socket)=>{
    console.log("connection " +socket.id)
    socket.on("join-room",data=>{
        console.log("new connection")
        const {roomId,emailId}=data;
        console.log(emailId+" joined room "+roomId)
        emailToSocketMap.set(emailId,socket.id);
        socketToEmailMap.set(socket.id,emailId)
        socket.emit("joined-room",{roomId});
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-joined",{emailId})
    })

    socket.on("call-user",data=>{
        const {offer,emailId}=data;
        const fromEmail=socketToEmailMap.get(socket.id)
        const socketId=emailToSocketMap.get(emailId)
        socket.to(socketId).emit("incommming-call",{offer,from:fromEmail})
    })
})

app.listen(process.env.PORT,()=>{
    console.log("server started at port "+process.env.PORT)
})


io.listen(8000)



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(bodyParser.json())
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
app.options("*",cors({
    origin:"*",
    credentials:true,
    methods:["GET","DELETE","PUT","POST"]
    
}))
app.use("/api/v1",patient);
app.use("/api/v1",doctor);
app.use("/api/v1/admin",admin);






export default app;