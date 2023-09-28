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

  static async find(data, collection) {
    const result = await database.collection(collection).find(data).toArray()

    return result
  }

  static async findOne(data, collection) {
    const result = await database.collection(collection).findOne(data)

    return result
  }

  static async updateOne(filter, update, collection) {
    const result = await database.collection(collection).updateOne(filter, update)

    return result
  }

  static async findOneAndUpdate(filter, update, collection) {
    const result = await database.collection(collection).findOneAndUpdate(filter, update)

    return result
  }

  static async deleteOne(filter, collection) {
    const result = await database.collection(collection).deleteOne(filter)

    return result
  }
}

module.exports = {
  Database
}
