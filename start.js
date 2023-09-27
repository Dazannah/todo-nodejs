require("dotenv").config()
const { MongoClient } = require("mongodb")
const client = new MongoClient(process.env.MONGODBCONNECTIONSTRING)

async function start() {
  await client.connect()
  const database = client.db("todo")
  module.exports = database

  const server = require("./server")
  server.listen(3000)
}

start()
