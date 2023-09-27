const { Database } = require("./Database")
const Email = require("./Email")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

class LoginUser {
  constructor(data) {
    this.data = data
    this.error = []
  }

  async startLogin() {
    this.#validateInput()
    if (this.error.length > 0) return this.#handleError()

    await this.#findUser()
    if (this.error.length > 0) return this.#handleError()

    await this.#checkPassword()
    if (this.error.length > 0) return this.#handleError()

    this.#isEmailValidated()
    if (this.error.length > 0) return this.#handleError()

    return { loginSuccess: true, id: this.foundUser._id.toString(), username: this.foundUser.username, email: this.foundUser.email }
  }

  #validateInput() {
    if (this.data.username.trim() === "" || this.data.username == null) this.error.push("Username required.")
    if (this.data.password.trim() === "" || this.data.password == null) this.error.push("Password required.")
  }

  async #findUser() {
    this.foundUser = await Database.findOne({ username: this.data.username }, "users")
    if (this.foundUser == null) this.error.push("Incorrect username/password.")
  }

  async #checkPassword() {
    const result = await bcrypt.compare(this.data.password, this.foundUser.password)
    if (!result) this.error.push("Incorrect username/password.")
  }

  #isEmailValidated() {
    if (!this.foundUser.isValidated) this.error.push("You have to validate your email before login.")
  }

  #handleError() {
    return { loginSuccess: false, errors: this.error, username: this.data.username }
  }
}

class RegisterUser {
  constructor(data) {
    this.data = data
    this.error = []
  }

  async startRegistration() {
    this.#validateUserInputs()
    if (this.error.length > 0) return this.#handleError()

    await this.#isUsernameAndEmailTaken()
    if (this.error.length > 0) return this.#handleError()

    this.#createPasswordHash()
    this.#createValidationLink()
    this.#serializeDataToSave()
    await this.#insertIntoDatabase()
    if (this.error.length > 0) return this.#handleError()

    await this.#sendVerificationEmail()
  }

  #validateUserInputs() {
    if (this.data.username.trim() === "") this.error.push("You have to provide a username.")
    if (this.data.email.trim() === "") this.error.push("You have to provide an email address.")
    if (this.data.password.trim() === "") this.error.push("You have to provide a password.")
    if (this.data.passwordConfirmation.trim() === "") this.error.push("You have to confirm your password.")

    if (this.data.password.trim() !== this.data.passwordConfirmation.trim()) this.error.push("The password don't match.")

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!emailRegex.test(this.data.email.trim())) this.error.push("You have to provide a valid email address")

    const capitalCaseRegex = /^(?=.*\d)[A-Z0-9].{8,16}$/
    if (!capitalCaseRegex.test(this.data.password)) this.error.push("The password must have at least one upper case letter, a number and the length has to be between 8 and 16 letter.")
  }

  async #isUsernameAndEmailTaken() {
    const result = await Database.getUserByEmailUsername(this.data.email, this.data.username)

    if (result.length > 0) this.error.push("The username/email is already taken.")
  }

  #createPasswordHash() {
    const salt = bcrypt.genSaltSync(10)
    this.data.password = bcrypt.hashSync(this.data.password, salt)
  }

  #createValidationLink() {
    const time = Date.now()
    this.data.validationString = crypto.createHash("md5").update(`${time}`).digest("hex")
  }

  #serializeDataToSave() {
    delete this.data.passwordConfirmation
    this.dataToSave = {
      ...this.data,
      isValidated: false
    }
  }

  async #insertIntoDatabase() {
    try {
      await Database.saveOne(this.dataToSave, "users")
    } catch (err) {
      this.error.push("Registration failed.")
    }
  }

  async #sendVerificationEmail() {
    try {
      const email = new Email(this.data.email, "verification@davidfabian.hu", "Account verification", `Visit: http://localhost:3000/verification/${this.data.validationString} for finalize your registration, on the ToDo site.`, `Visit: http://localhost:3000/verification/${this.data.validationString} for finalize your registration, on the ToDo site.`)
      await email.send()
    } catch (err) {
      this.error.push("Verification email sending failed.")
    }
  }

  #handleError() {
    return { errors: this.error, user: { username: this.data.username, email: this.data.email } }
  }
}

class VerifiUserEmail {
  constructor(validationString) {
    this.validationString = validationString
  }

  async verifi() {
    await Database.updateOne({ validationString: this.validationString }, { $set: { isValidated: true } }, "users")
  }
}

module.exports = {
  LoginUser,
  RegisterUser,
  VerifiUserEmail
}
