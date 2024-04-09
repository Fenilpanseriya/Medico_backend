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
    return parser.format(ext,file.buffer);
    
}

export default getDataUri;