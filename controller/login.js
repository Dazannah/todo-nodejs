async function getLogin(req, res, next) {
  res.render("login.ejs")
}

async function login(req, res, next) {
  res.render("login.ejs")
}

module.exports = {
  getLogin,
  login
}
