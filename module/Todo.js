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

  async saveNewToDo(todoText) {
    const dataToSave = {
      userId: new ObjectId(this.userdata.id),
      text: todoText
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
