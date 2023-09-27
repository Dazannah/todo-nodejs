async function getTodos(req, res, next) {
  res.render("todos")
}

module.exports = {
  getTodos
}
