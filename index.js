const express = require("express")
const server = express()

const router = require("./router")

server.set("view engine", "ejs")
server.set("public")
server.use(router)

server.listen(3000)
