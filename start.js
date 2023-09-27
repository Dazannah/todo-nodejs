const { MongoClient } = require("mongodb")
const client = new MongoClient("mongodb://root:root@localhost:27017/")

async function start() {
  await client.connect()
  const database = client.db("todo")
  module.exports = database

  const server = require("./server")
  server.listen(3000)
}

start()
