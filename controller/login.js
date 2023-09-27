async function login(req, res, next) {
  res.render("login.ejs")
}

async function validateLogin(req, res, next) {
  console.log(req.body)
  res.render("login.ejs")
}

module.exports = {
  login,
  validateLogin
}
