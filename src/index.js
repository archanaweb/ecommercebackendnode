// const express = require('express')
import dotenv from 'dotenv'
import express from "express"
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dbConnect from './db/index.js'
const app = express()

dotenv.config({
    path: './.env'
})
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
dbConnect();


// (async()=> {
//     try {
//         await mongoose.connect(`${process.env.MONGOBD_URL}/${DB_NAME}`)
//         app.on("error", (error)=> {
//             console.error("ERROR: ", error);
//         throw error
//         })

//         app.listen(process.env.PORT, () => {
//     console.log(`App is listening on port ${process.env.PORT}`)
// })
//     } catch (error) {
//         console.error("ERROR: ", error);
//         throw error
//     }
// })()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get("/login", (req, res)=>{
    res.send("Please login to your app")

})
app.get("/youtube", (req, res) => {
    res.send("<h2>Learning from chai and code</h2>")
})
// get a list of jokes
app.get("/api/jokes", (req, res) => {
    const jokes = [
        {id: 1, title: "A joke", conten: "This is a joke"},
        {id: 1, title: "Another joke", conten: "This is Another joke"},
        {id: 1, title: "A third joke", conten: "This is a third joke"},
        {id: 1, title: "A fourth joke", conten: "This is a fourth joke"},
        {id: 1, title: "A fifth joke", conten: "This is a fifth joke"}
    ]
    res.json(jokes)

})

 app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`)
 })


