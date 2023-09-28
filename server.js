const express = require("express")
const server = express()

const session = require("express-session")
const { MongoClient } = require("mongodb")
const MongoStore = require("connect-mongo")
const client = new MongoClient("mongodb://root:root@localhost:27017/")
const router = require("./router")

const sessionOptions = session({
  secret: "some safely generated secret",
  store: MongoStore.create({ client: client, dbName: "todo" }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
})
server.use(sessionOptions)

server.use(express.static("public"))
server.set("view engine", "ejs")
server.use(express.urlencoded({ extended: false }))
server.use("/", router)

module.exports = server
