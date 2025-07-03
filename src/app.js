import express from "express"; 
import cors from "cors";
import cookieParser from "cookie-parser";

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials:true
    }
))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//Imports of routes
import userRouter from "./routes/user.routes.js"

//Declaration of routes 

const app = express(); 

export default app; 