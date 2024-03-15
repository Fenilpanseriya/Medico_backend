import Hospital from "../models/hospital.model.js";

export const addHospital=async(req,res)=>{
    const {hospitalName,hospitalAddress,diseaseSpecialist}=req.body;
    console.log(hospitalName,hospitalAddress,diseaseSpecialist)
    if(!hospitalName || !hospitalAddress || !diseaseSpecialist){
        return res.status(400).json({message:"Please fill all fields"});
    }
    else{
        try {
            let diseaes= diseaseSpecialist.map((item)=>item.value)
            console.log(diseaes)
            const hospital=await Hospital.create({hospitalName,hospitalAddress,diseaseSpecialist:diseaes})
            if(hospital){
                return res.status(200).json({
                    message:"added successfully",
                    hospital
                })
            }
            
        } catch (error) {
            return res.status(400).json({
                message:error.message
            })
        }
        
    }
}
