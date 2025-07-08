import {asyncHandler} from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"

const registerUser = asyncHandler( async (req, res) => {
    /* 
        1. get user details from the backend 
        2. validate user details if empty or not 
        3. Check if the user already exist 
        4. Check for the images, Check for the avtar if exist 
        5. Upload them to cloudinary 
        6. Create a data entry into the database
        7. Remove the password and the refresh token from the response 
        8. Check for the user creation 
        9. Return result
    */
    const {fullName, email, userName, password} = req.body
    console.log("Email:", email );

    if(
        [fullName, email, userName, password].some((field)=>field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    
    const existingUser = User.findOne({
        $or: [{ userName }, { email}]
    })

    if(existingUser) {
        throw new ApiError(409, "User with username or email already exist")
    }

    

})

export  {registerUser}