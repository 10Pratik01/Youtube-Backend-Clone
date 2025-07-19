import {asyncHandler} from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { ApiResponse } from "../utils/ApiResponse.js";
import { json } from "express";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while Generating Access and Refresh Token");
    }
}   

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
    
    // Checking for any existing users 
    const existingUser =  await User.findOne({
        $or: [{ userName }, { email}]
    })

    if(existingUser) {
        throw new ApiError(409, "User with username or email already exist")
    }


    // creating a variable to store the images path
    const avatarLocalPath = req.files?.avatar[0]?.path; 

    // const coverImageLocalPath = req.files?.coverImage[0]?.path; 
    let coverImageLocalPath; 
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar field is required")
    }

    // uploading and storing the information of cloudinary in a variable
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }

    // creating a user in mongoDB where avatar and coverImage are been stored as the url sent by cloudinary 
    const user = await User.create({
        fullName, 
        avatar: avatar.url, 
        coverImage: coverImage?.url || "",  
        email,
        password, 
        userName: userName.toLowerCase(), 
    })

    // Sending a success response where user and refresh token is removed from the list
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

const loginUser = asyncHandler(async (req, res) => {
    /* 
        Todo list for the loginUser
        take the items from the body  
        userName or Email 
        // find the user or email 
        password
        check password 
        create a refresh token and asscess token 
        and check if it is expire or not 
    */

    const {email, password, userName} = req.body; 

    if(!(email || userName)) {
        throw new ApiError(400, "Email or userName is required")
    }
    if(!password) {
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({
        $or : [{email}, {userName}]
    })

    if (!user) {throw new ApiError(404, "Email or userName not found")}; 

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){ throw new ApiError(401, "Invalid password")}

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    
    const logedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
     
    const options = {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production'
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
        new ApiResponse(200, 
            {
                user: logedInUser, accessToken, refreshToken
            }, 
            "User logged in successfuly"
        )
    )
    
})

const logoutUser = asyncHandler(async (req, res) => {
    /*
        check if user exist 
        check id user is logged in 
        if user is logged in then log out 
        delete refresh token and delet access token
        clear cookies 
    */
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined, 
            }
        },
        {
            new: true
        }

    )
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
    
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // geting token from user 
    const incomingRefreshToken = await req.cookies?.refreshToken || req.body.refreshToken 

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        // verifying the token 
        const verifyToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        if(!verifyToken){
            throw new ApiError(401 , "Session expired")
        }
    
        // geting the user details from the user 
        const user = await User.findOne(verifyToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid user Token")
        }
        
        // cheking if the refresh token with the user is valid or used or expired with the token in the database
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "user token is not valid")
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)
        
        const options = {
            httpOnly: true,
            secure: true 
        }
    
        const detailOfUser = User.findById(user._id).select(
            "-password -refreshToken -accessToken -createdAt -updatedAt"
        )
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                detailOfUser,
                "Access token generated successfully",
    
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid user token")
    }


})


export  {registerUser, loginUser, logoutUser, refreshAccessToken}