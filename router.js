const express = require("express")
const router = express.Router()
const { isLoggedin } = require("./middleware/isLoggedin")

const registrationController = require("./controller/registration")
const loginController = require("./controller/login")
const todoController = require("./controller/todo")

router.get("/registration", registrationController.renderRegistration)
router.post("/registration", registrationController.registration)

router.get("/", loginController.renderLogin)
router.post("/login", loginController.login)
router.get("/verification/:validationString", registrationController.verifiUserEmail)

router.use(isLoggedin)
router.get("/todo", todoController.getTodos)
router.post("/add-todo", todoController.addNew)
router.post("/delete-todo", todoController.deleteToDo)
router.get("/edit-todo/:todoid", todoController.getEditTodo)
router.post("/edit-todo", todoController.saveEdited)
router.get("/done-todo/:todoid", todoController.markDone)

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/")
  })
})

router.get("/*", (req, res) => {
  res.render("404.ejs")
})

module.exports = router
