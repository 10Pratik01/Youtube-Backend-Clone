import connectDB from "./db/index.js";
import dotenv from "dotenv"
import {app} from './app.js'


dotenv.config({
    path:"./env"
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`SERVER IS RUNNING AT PORT: ${process.env.PORT}`)
    })
    
    app.on("error", (error)=>{
        console.log("There is an ERROR:" , error)
    })
})
.catch((error)=>{
    console.error("DATABASE CONNECTION ERROR", error);
})

