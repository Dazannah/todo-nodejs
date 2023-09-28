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
    await todo.saveNewToDo(req.body["new-todo"], req.body["deadline"])

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

async function getEditTodo(req, res, next) {
  try {
    const todo = new Todo(req.session.user)
    const result = await todo.getOneToDo(req.params.todoid)

    res.render("includes/todo.ejs", { todo: result, editable: true })
  } catch (err) {
    console.log(err)
  }
}

async function saveEdited(req, res, next) {
  const todo = new Todo(req.session.user)
  await todo.updateOne(req.body)

  res.redirect("/todo")
}

module.exports = {
  getTodos,
  addNew,
  deleteToDo,
  getEditTodo,
  saveEdited
}
