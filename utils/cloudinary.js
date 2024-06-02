import {v2 as cloudinary} from 'cloudinary';

const cofigClodinary=async()=>{
    
    await cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret:process.env.API_SECRET
    });

    return cloudinary;
}

export default cofigClodinary;