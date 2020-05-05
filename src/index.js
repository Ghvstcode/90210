const express = require('express')
require('./Db/database')
const UserRouter = require('./Routers/Users')
const BlogRouter = require('./Routers/BlogPosts')

const app = express()

app.use(express.json())
app.use(UserRouter)
app.use(BlogRouter)

const port = process.env.PORT || 3006

app.listen(port, ()=> {
    console.log('Server is running on port ' + port)
})




