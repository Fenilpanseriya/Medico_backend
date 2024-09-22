import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { createServer } from 'http';
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import patient from "./routes/patientRoutes.js"
import doctor from "./routes/doctorRoutes.js"
import admin from "./routes/adminRoutes.js"
import payment from "./routes/paymentRoutes.js"
import Razorpay from "razorpay"
import { connectDb } from "./config/connectDB.js";
import { Server } from "socket.io"
import cofigClodinary from "./utils/cloudinary.js";
import { rateLimit } from 'express-rate-limit'
import proxy from "express-http-proxy";
import {createProxyMiddleware} from "http-proxy-middleware"
import { Kafka } from "kafkajs";
import  initTopics  from "./utils/initTopics.js";
import { runDataService } from "./data-service/dataService.js";
dotenv.config();

connectDb();
  
export const cloudinary=await cofigClodinary();
const app = express();
export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});

const io = new Server(process.env.WEBRTC_PORT, {
    cors: true,
  });
  
  const emailToSocketIdMap = new Map();
  const socketidToEmailMap = new Map();
  
  io.on("connection", (socket) => {
    console.log(`Socket Connected`, socket.id);
    socket.on("room:join", (data) => {
      const { email, room } = data;
      emailToSocketIdMap.set(email, socket.id);
      socketidToEmailMap.set(socket.id, email);
      io.to(room).emit("user:joined", { email, id: socket.id });
      socket.join(room);
      io.to(socket.id).emit("room:join", data);
    });
  
    socket.on("user:call", ({ to, offer }) => {
      io.to(to).emit("incomming:call", { from: socket.id, offer });
    });
  
    socket.on("call:accepted", ({ to, ans }) => {
      io.to(to).emit("call:accepted", { from: socket.id, ans });
    });
  
    socket.on("peer:nego:needed", ({ to, offer }) => {
      console.log("peer:nego:needed", offer);
      io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });
  
    socket.on("peer:nego:done", ({ to, ans }) => {
      console.log("peer:nego:done", ans);
      io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
  });

app.listen(process.env.PORT,()=>{
    console.log("server started at port "+process.env.PORT)
})

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 10 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	message:"too many request, please try after 10 minutes"
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(bodyParser.json())
app.use(express.urlencoded({
    extended:true,
}))



app.use((req, res, next) => {
    // set the CORS policy
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    // set the CORS headers
    res.header(
      "Access-Control-Allow-Headers",
      "origin, X-Requested-With,Content-Type,Accept, Authorization"
    );
    // set the CORS method header
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "GET,PATCH,DELETE,POST,PUT");
      res.header("Access-Control-Allow-Origin","http://localhost:3000")
      return res.status(200).json({});
    }
    next();
  });

app.use(cookieParser());

app.use(cors({
    origin:'http://localhost:3000',
    credentials:true,
    methods:["GET","DELETE","PUT","POST"]
    
}))
// app.options("*",cors({
//     origin:'http://localhost:3000',
//     credentials:true,
//     methods:["GET","DELETE","PUT","POST"]
    
// }))


export const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [process.env.KAFKA_BROKER],
  
});

await initTopics();
await runDataService();
const medicineProxy=proxy('http://localhost:6070')
app.use("/hello",(req,res)=>{
	res.send("hello....");
})
app.use("/api/v1",patient);
app.use("/api/v1",doctor);
app.use("/api/v1/admin",admin);
app.use("/api/v1/payment",payment);
// Proxy configuration
app.use('/api/v1/medicine', createProxyMiddleware({
  target: 'http://localhost:6070/medicine',
  changeOrigin: true,
}));

app.use('/api/v1/razorpay-payment', proxy("http://localhost:7000/razorpay-payment"));

export default app;
