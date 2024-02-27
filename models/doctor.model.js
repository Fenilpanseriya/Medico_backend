import mongoose from "mongoose";

const doctorSchema=mongoose.Schema({
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
        type:Date,
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
    doctorAddress:{
        type:String,
        default:""
    },
    experience:{
        type:Number,
        default:0
    },
    doctorRating:{
        type:Number,
        min:[0,"rating should not be less than 0"],
        max:[5,"rating should not be above 5"]
    },
    doctorDegree:{
        type:Array,
        of:String,
        default:[]
    },
    hospitalName:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hospital"

    }],
    fees:{
        type:Number,
        default:0
    },

})

const Doctor=mongoose.models.Doctor || mongoose.model("Doctor",doctorSchema);
export default Doctor;