import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

    // Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_API_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async function (localUrl){
    try {
        if(!localUrl) return null
        // to upload the file on cloudinary 
        const response = await cloudinary.uploader.upload(localUrl, {
            resource_type: "auto", 
        })
        console.log("File is uploaded successfully on cloudinary", response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localUrl)
        return null 
    }
}
    

export {uploadOnCloudinary}; 