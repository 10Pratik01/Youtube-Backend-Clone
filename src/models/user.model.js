import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


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

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    
    this.password = bcrypt.hash(this.password, 10)
    next()
});

userSchema.methods.isPasswordCorrect = async function(pass){
    return await bcrypt.compare(pass, this.password)
};

userSchema.methods.generateAccessToken = async function(token){
    return jwt.sign(
        {
            _id: this._id, 
            userName: this.userName, 
            fullName: this.fullName, 
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        } 
    )
}

userSchema.methods.generateRefreshToken = async function(token){
    return jwt.sign(
        {
            _id : this._id, 
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY, 
        }
    )
}

export  const User = mongoose.model("User", userSchema)