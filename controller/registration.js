const { RegisterUser } = require("../module/User")

function renderRegistration(req, res, next) {
  res.render("registration.ejs")
}

async function registration(req, res, next) {
  try {
    const registerUser = new RegisterUser(req.body)
    const result = await registerUser.registrationProcess()

    if (result) {
      res.render(`registration.ejs`, {
        username: result.user.username,
        email: result.user.email,
        errors: result.errors
      })
    } else {
      res.redirect("/login")
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  renderRegistration,
  registration
}
