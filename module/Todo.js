const { Database } = require("./Database")
const { ObjectId } = require("mongodb")

class Todo {
  constructor(userdata) {
    this.userdata = userdata
  }

  async getUserToDos() {
    const filter = {
      userId: new ObjectId(this.userdata.id)
    }
    const result = await Database.find(filter, "todos")

    return result
  }

  async getOneToDo(todoId) {
    const filter = {
      $and: [{ _id: new ObjectId(todoId) }, { userId: new ObjectId(this.userdata.id) }]
    }

    const result = await Database.findOne(filter, "todos")

    return result
  }

  async updateOne(data) {
    const filter = {
      $and: [{ _id: new ObjectId(data["todo-id"]) }, { userId: new ObjectId(this.userdata.id) }]
    }

    const update = {
      $set: {
        deadline: data.deadline,
        text: data["new-todo"]
      }
    }

    await Database.updateOne(filter, update, "todos")
  }

  async saveNewToDo(todoText, deadline) {
    const dataToSave = {
      userId: new ObjectId(this.userdata.id),
      text: todoText,
      deadline
    }

    await Database.saveOne(dataToSave, "todos")
  }

  async deleteToDo(toDoId) {
    const filter = {
      userId: new ObjectId(this.userdata.id),
      _id: new ObjectId(toDoId)
    }

    await Database.deleteOne(filter, "todos")
  }
}

module.exports = Todo
