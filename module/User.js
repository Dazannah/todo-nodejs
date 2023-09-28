require("dotenv").config()

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

    if (this.data.password.trim() !== this.data.passwordConfirmation.trim()) this.error.push("The passwords don't match.")

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
      const email = new Email(this.data.email, "verification@davidfabian.hu", "Account verification", `Visit: ${process.env.DOMAIN}/verification/${this.data.validationString} for finalize your registration, on the ToDo site.`, `Visit: ${process.env.DOMAIN}/verification/${this.data.validationString} for finalize your registration, on the ToDo site.`)
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
    await Database.updateOne({ validationString: this.validationString }, { $set: { isValidated: true }, $unset: { validationString: "" } }, "users")
  }
}

class ResetPasswordEmail {
  constructor(username) {
    this.username = username
    this.error = []
  }

  async resetProcess() {
    await this.#isUsernameExist()

    if (this.userData == null) return
    this.#generateResetString()

    await this.#saveResetString()
    await this.#sendResetLink()
  }

  async #isUsernameExist() {
    const filter = {
      username: this.username
    }

    this.userData = await Database.findOne(filter, "users")
  }

  #generateResetString() {
    const time = Date.now()
    this.resetString = crypto.createHash("md5").update(`${time}`).digest("hex")
  }

  async #saveResetString() {
    try {
      const filter = {
        _id: this.userData._id
      }

      const update = {
        $set: { resetString: this.resetString }
      }

      await Database.updateOne(filter, update, "users")
    } catch (err) {
      console.log(err)
    }
  }

  async #sendResetLink() {
    try {
      const email = new Email(this.userData.email, "verification@davidfabian.hu", "Password reset", `Visit: ${process.env.DOMAIN}/reset-password/${this.resetString} for reset your password.`, `Visit: ${process.env.DOMAIN}/reset-password/${this.resetString} for reset your password.`)
      await email.send()
    } catch (err) {
      console.log(err)
    }
  }
}

class ResetPassword {
  constructor(resetString, passwords) {
    this.resetString = resetString
    this.passwords = passwords
    this.error = []
  }

  async reset() {
    this.#validatePassword()
    if (this.error.length > 0) return this.error

    this.#generatePasswordHash()
    await this.#saveNewPassword()
    if (this.error.length > 0) return this.error

    return ["Password successfully changed."]
  }

  #validatePassword() {
    if (this.passwords.password.trim() === "" || this.passwords.password == null) this.error.push("Password required.")

    if (this.passwords.password.trim() === "") this.error.push("You have to provide a password.")
    if (this.passwords.passwordConfirmation.trim() === "") this.error.push("You have to confirm your password.")

    if (this.passwords.password.trim() !== this.passwords.passwordConfirmation.trim()) this.error.push("The passwords don't match.")

    const capitalCaseRegex = /^(?=.*\d)[A-Z0-9].{8,16}$/
    if (!capitalCaseRegex.test(this.passwords.password)) this.error.push("The password must have at least one upper case letter, a number and the length has to be between 8 and 16 letter.")
  }

  #generatePasswordHash() {
    const salt = bcrypt.genSaltSync(10)
    this.password = bcrypt.hashSync(this.passwords.password, salt)
  }

  async #saveNewPassword() {
    const filter = {
      resetString: this.resetString
    }

    const update = {
      $set: {
        password: this.password
      },
      $unset: {
        resetString: ""
      }
    }
    const result = await Database.findOneAndUpdate(filter, update, "users")

    if (!result.value?.username) {
      this.error.push("Invalid password reset link.")
    }
  }
}

module.exports = {
  LoginUser,
  RegisterUser,
  VerifiUserEmail,
  ResetPasswordEmail,
  ResetPassword
}
