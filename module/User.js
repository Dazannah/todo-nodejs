const { Database } = require("./Database")
const Email = require("./Email")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

class User {
  constructor(data) {
    this.data = data
    this.error = []
  }

  getUserData() {
    return this.data
  }
}

class RegisterUser {
  constructor(data) {
    this.data = data
    this.error = []
  }

  async registrationProcess() {
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

module.exports = {
  User,
  RegisterUser
}
