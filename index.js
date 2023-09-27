const express = require("express")
const server = express()

const { startServer } = require("./database")
const router = require("./router")

server.set("view engine", "ejs")
server.set("public")
server.use(router)

startServer()
module.exports = server
