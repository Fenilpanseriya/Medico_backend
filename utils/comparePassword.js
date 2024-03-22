import bcrypt from "bcryptjs"

export const comparePassword=async(password,patientPassword)=>{
    console.log(password,patientPassword)
    const isMatch= await bcrypt.compare(password,patientPassword)
    return true;
    
}