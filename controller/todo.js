const Todo = require("../module/Todo")

async function getTodos(req, res, next) {
  const todo = new Todo(req.session.user)
  const userTodos = await todo.getUserToDos()

  res.render("todos", {
    todos: userTodos
  })
}

async function addNew(req, res, next) {
  try {
    const todo = new Todo(req.session.user)
    await todo.saveNewToDo(req.body["new-todo"])

    res.redirect("/todo")
  } catch (err) {
    console.log(err)
  }
}

async function deleteToDo(req, res, next) {
  try {
    const todo = new Todo(req.session.user)
    await todo.deleteToDo(req.body["todo-id"])

    res.redirect("/todo")
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  getTodos,
  addNew,
  deleteToDo
}
