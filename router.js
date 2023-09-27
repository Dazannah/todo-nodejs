const express = require("express")
const router = express.Router()

const registrationController = require("./controller/registration")
const loginController = require("./controller/login")

router.get("/registration", registrationController.renderRegistration)
router.post("/registration", registrationController.registration)

router.get("/login", loginController.renderLogin)
router.post("/login", loginController.login)

module.exports = router
