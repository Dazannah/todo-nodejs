const nodemailer = require("nodemailer")
require("dotenv").config()

class Email {
  constructor(to, from, subject, plainText, htmlText) {
    this.to = to
    this.from = from
    this.subject = subject
    this.plainText = plainText
    this.htmlText = htmlText
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAILHOST,
      port: process.env.EMAILPORT,
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASSWORD
      }
    })
  }

  async send() {
    const info = await this.transporter.sendMail({
      from: `<${this.from}>`,
      to: `${this.to}`,
      subject: this.subject,
      text: this.plainText,
      html: this.htmlText
    })
  }
}

module.exports = Email
