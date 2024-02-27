import mongoose from "mongoose";

const hospitalSchema=mongoose.Schema({
    hospitalName:{
        type:String,
        requiured:true,
    },
    hospitalAddress:{
        landmark:{
            type:String
        },
        city:{
            type:String
        },
        state:{
            type:String
        },
        pincode: {
            type: String,
            trim:true,
            required: true,
            minlength: 6,
            maxlength: 6,
            match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode'] 
        },
    },
    contactNumbers:{
        type:Array,
        default:[]
    },
    hospitalRating:{
        type:Number,
        min:[0,"rating should not be less than 0"],
        max:[5,"rating should not be above 5"]
    },
    room:{
        emergencyRoom:{
            type:String,
            default:0
        },
        icuRoom:{
            type:String,
            default:0
        },
        normalRoom:{
            type:String,
            default:0
        }

    },
    diseaseSpecialist:{
        type:Array,
        of:String,
        default:[]
    },
    medicine:{
        type:Map,// medicine name as key and totalavailable medicine as value
        of:String
    },
    doctors:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Doctor"
        }
    ]
})

const Hospital=mongoose.models.Hospital || mongoose.model("Hospital",hospitalSchema)
export  default Hospital;