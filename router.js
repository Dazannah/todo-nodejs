const express = require("express")
const router = express.Router()

const loginController = require("./controller/login")

router.get("/login", loginController.login)
router.post("/login", loginController.validateLogin)

module.exports = router
