// const express = require('express')
import dotenv from 'dotenv'
import dbConnect from './db/index.js'
import {app} from "./app.js"


dotenv.config({
    path: './.env'
})

dbConnect()
.then(() => {
     app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`)
 })
})
.catch((err) => {
    console.log(`MONGODB connection failed `, err)
})


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

// app.get("/login", (req, res)=>{
//     res.send("Please login to your app")

// })
// app.get("/youtube", (req, res) => {
//     res.send("<h2>Learning from chai and code</h2>")
// })
// // get a list of jokes
// app.get("/api/jokes", (req, res) => {
//     const jokes = [
//         {id: 1, title: "A joke", conten: "This is a joke"},
//         {id: 1, title: "Another joke", conten: "This is Another joke"},
//         {id: 1, title: "A third joke", conten: "This is a third joke"},
//         {id: 1, title: "A fourth joke", conten: "This is a fourth joke"},
//         {id: 1, title: "A fifth joke", conten: "This is a fifth joke"}
//     ]
//     res.json(jokes)

// })




