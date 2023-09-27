const { MongoClient } = require("mongodb")

const client = new MongoClient("mongodb://root:root@localhost:27017/")

async function startServer() {
  await client.connect()
  const database = client.db("todo")
  module.exports = database
  const server = require("./index")
  server.listen(3000)
}

module.exports = { startServer }
