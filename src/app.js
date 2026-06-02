// have to work in app.js file
import express from "express"
import cors from 'cors'
import cookieParser from 'cookie-parser';


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import userRoute from './routes/user.routes.js'
import videoRoute from './routes/video.routes.js'
import { errorHandler } from "./middlewares/error.middlewear.js";


// routes declaration
app.use("/api/users", userRoute)

app.use("/api/videos", videoRoute)

app.use(errorHandler)


export {app}

