const { RegisterUser, VerifiUserEmail } = require("../module/User")

function renderRegistration(req, res, next) {
  res.render("registration.ejs")
}

async function registration(req, res, next) {
  try {
    const registerUser = new RegisterUser(req.body)
    const result = await registerUser.startRegistration()

    if (result) {
      res.render(`registration.ejs`, {
        id: result.user.id,
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

async function verifiUserEmail(req, res, next) {
  try {
    const verifiEmail = new VerifiUserEmail(req.params.validationString)
    await verifiEmail.verifi()

    res.redirect("/")
  } catch (err) {
    //res.redirect("/")
    console.log(err)
  }
}

module.exports = {
  renderRegistration,
  registration,
  verifiUserEmail
}
