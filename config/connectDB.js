import mongoose from "mongoose";

export const connectDb=async()=>{
    try{
        const {connection}=await mongoose.connect(process.env.MONGO_URI);
        console.log(`mongodb connection with ${connection.host}`)
    }
    catch(err){
        console.log("error in connection is " +err.message)
    }
   
}