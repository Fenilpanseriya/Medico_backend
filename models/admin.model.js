import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const phoneNumberRegex = /^\d{10}$/;  
import crypto from "crypto"

const adminSchema=mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true,"Please enter your name"]
    },
    password:{
        type:String,
        required:true,
        unique:[true,"this password is used!! please enter other unique password"],
        min:[6,"Password should be of atleast 6 digit"]
    },
    email:{
        type:String,
        required:[true,"Email is compulsory"],
        unique:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        trim:true,
        lowercase:true
    },
    birthDate:{
        type:String,
        required:[true,"please enter your birthdate"]
    },
    age:{
        type:[Number,"age should be number"],
        required:[true,"please enter your Age"]
    },
    phoneNumber: {
        type: String,
        trim:true,
        unique: [true, "Phone number is already in use."],
        match:[phoneNumberRegex,"enter valid phone number"],
        default: "",
    },
    gender:{
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    photo:{
        public_id:{
            type:String,
        },
        url:{
            type:String
        }

    },
    adminAddress:{
        type:String,
        default:""
    },
    resetPasswordToken:{
        type:String
    },
    resetPasswordExpire:{
        type:Date
    }

})

adminSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
    
    next();
})
adminSchema.methods.getResetToken=async function(){
    const resetToken=crypto.randomBytes(20).toString("hex")
    this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest("hex");
    this.resetPasswordExpire=Date.now()+15*60*1000;
    return resetToken;
}
const Admin=mongoose.models.Admin || mongoose.model("admin",adminSchema);
export default Admin;