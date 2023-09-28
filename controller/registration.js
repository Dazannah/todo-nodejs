const { RegisterUser, VerifiUserEmail, ResetPasswordEmail, ResetPassword } = require("../module/User")

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
    res.redirect("/")
    console.log(err)
  }
}

async function renderForgotPassword(req, res, next) {
  res.render("forgotPassword.ejs")
}

async function resetPassword(req, res, next) {
  try {
    const reset = new ResetPasswordEmail(req.body.username)
    await reset.resetProcess()

    res.render("forgotPassword.ejs", { message: "E-mail is sent." })
  } catch (err) {
    console.log(err)
  }
}

async function renderReset(req, res, next) {
  res.render("resetPassword.ejs")
}

async function reset(req, res, next) {
  try {
    const resetPassword = new ResetPassword(req.params.resetString, req.body)
    const messages = await resetPassword.reset()

    res.render("resetPassword.ejs", { messages })
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  renderRegistration,
  registration,
  verifiUserEmail,
  renderForgotPassword,
  resetPassword,
  renderReset,
  reset
}
