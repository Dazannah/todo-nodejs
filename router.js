const express = require("express")
const router = express.Router()

const loginController = require("./controller/login")

router.get("/login", loginController.getLogin)
router.post("/login", loginController.login)

module.exports = router
