const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user_router')
const imageRouter = require('./routers/images_router')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(imageRouter)

module.exports = app
