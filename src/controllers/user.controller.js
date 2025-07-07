import {asyncHandler} from "../utils/asyncHandler.js"; 



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
    console.log("Email:", email )
    
})

export  {registerUser}