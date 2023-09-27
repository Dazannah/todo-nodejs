const database = require("../start")

class Database {
  static async getUserByEmailUsername(email, username) {
    const result = await database
      .collection("users")
      .find({ $or: [{ email }, { username }] })
      .toArray()

    return result
  }

  static async saveOne(data, collection) {
    const result = await database.collection(collection).insertOne(data)

    return result
  }
}

module.exports = {
  Database
}
