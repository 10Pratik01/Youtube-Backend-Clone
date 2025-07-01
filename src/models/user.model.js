import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        userName:{
            type: String, 
            required: true, 
            unique: true,
            lowercase: true, 
            trim: true,
            index: true, 
        },
        email:{
            type: String,
            required: true,
            unique: true, 
            lowercase: true,
            trim: true,
        },
        fullName:{
            type: String,
            required: true,
            trim: true, 
            index: true, 
        },
        avatar:{
            type: String, //url is comming from cloudinary
            required: true,
        }, 
        coverImage:{
            type: String, //url is comming from cloudinary
        },
        watchHistory: 
        [
            {
                type: mongoose.Schema.Types.ObjectId, 
                ref : "Video"
            }
        ],
        password:{
            type: String,
            required: [true, "Please enter a password"],
        }, 
        refreshToken:{
            type: String, 
            
        }
    },
    {
        timestamps: true
    }
)

export  const User = mongoose.model("User", userSchema)