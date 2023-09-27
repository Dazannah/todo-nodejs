const express = require("express")
const server = express()

const { MongoClient } = require("mongodb")
const session = require("express-session")
const MongoStore = require("connect-mongo")

const router = require("./router")
const client = new MongoClient("mongodb://root:root@localhost:27017/")

startServer()

async function startServer() {
  await client.connect()
  const database = client.db("todo")

  const sessionOptions = session({
    secret: "some safely generated secret",
    store: MongoStore.create({ client: client }),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
  })

  server.use(sessionOptions)

  server.set("view engine", "ejs")
  server.use(express.urlencoded({ extended: false }))
  server.set("public")
  server.use("/", router)

  module.exports = { database }
  server.listen(3000)
}
