const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get("/login", (req, res)=>{
    res.send("Please login to your app")

})
app.get("/youtube", (req, res) => {
    res.send("<h2>Learning from chai and code</h2>")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
