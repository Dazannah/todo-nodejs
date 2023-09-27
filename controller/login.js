const { LoginUser } = require("../module/User")

async function renderLogin(req, res, next) {
  if (req.session.user) {
    res.redirect("/todo")
    return
  }
  res.render("login.ejs")
}

async function login(req, res, next) {
  try {
    const user = new LoginUser(req.body)
    const result = await user.startLogin()

    if (result.loginSuccess) {
      req.session.user = {
        id: result.id,
        username: result.username,
        email: result.email
      }
      req.session.save(() => {
        res.redirect(`/todo`)
      })
    } else {
      res.render("login.ejs", {
        errors: result.errors,
        username: result.username
      })
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  renderLogin,
  login
}
