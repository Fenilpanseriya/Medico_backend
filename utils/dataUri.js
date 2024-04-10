import DataUriParser from "datauri/parser.js"
import path from "path"
import ErrorHandler from "./eroorHandler.js";
const getDataUri=(file,next)=>{
    const parser=new DataUriParser();
    if (!file || !file.originalname) {
        
        return next(new ErrorHandler("Error: 'file' or 'file.originalname' is undefined."))
    }
    const ext=path.extname(file.originalname).toString();
    console.log(ext);

    //const validExtensions = ['.png', '.jpg', '.jpeg', '.gif']; // List of valid image extensions

    // if (!validExtensions.includes(ext)) {
    //     return next(new ErrorHandler("Invalid image file. Only PNG, JPG, JPEG, and GIF files are allowed."));
    // }
    //console.log("buffer "+JSON.stringify(file.buffer));
    return parser.format(ext,file.buffer);
    
}

export default getDataUri;