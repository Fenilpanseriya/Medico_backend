import mongoose from "mongoose";

const phoneNumberRegex = /^\d{10}$/;  



const patientSchema=mongoose.Schema({
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
    patientAddress:{
        type:String,
        default:""
    },
    diseases:{
        diseasesName:{
            type:String
        },
        medicines:{
            type:Array,
            of:String,
            default:[]
        },
        nextVisittime:{
            type:Date,
        },
        appointmentDate:{
            type:Date
        },
        doctor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Doctor"
        },
        caseFees:{
            type:Number,
            default:0
        },
        hospitalName:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Hospital"
        }
    },
    patientReview:{
        doctorName:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Doctor"
        },
        review:{
            type:String,
            default:""
        }
    }
})

const Patient=mongoose.models.Patient || mongoose.model("Patient",patientSchema);
export default Patient;