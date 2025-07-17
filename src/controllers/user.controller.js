import {asyncHandler} from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { ApiResponse } from "../utils/ApiResponse.js";

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
   

    if(
        [fullName, email, userName, password].some((field)=>field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    
    const existingUser =  await User.findOne({
        $or: [{ userName }, { email}]
    })

    if(existingUser) {
        throw new ApiError(409, "User with username or email already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path; 

    const coverImageLocalPath = req.files?.coverImage[0]?.path; 

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar field is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullName, 
        avatar: avatar.url, 
        coverImage: coverImage?.url || "",  
        email,
        password, 
        userName: userName.toLowerCase(), 
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registring new User")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})

export  {registerUser}