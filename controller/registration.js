function renderRegistration(req, res, next) {
  res.render("registration.ejs")
}

async function registration(req, res, next) {
  try {
    console.log(req.body)
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  renderRegistration,
  registration
}
