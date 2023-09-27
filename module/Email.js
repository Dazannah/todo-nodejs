const nodemailer = require("nodemailer")

class Email {
  constructor(to, from, subject, plainText, htmlText) {
    this.to = to
    this.from = from
    this.subject = subject
    this.plainText = plainText
    this.htmlText = htmlText
    this.transporter = nodemailer.createTransport({
      host: "smtp.elasticemail.com",
      port: 2525,
      auth: {
        user: "verification@davidfabian.hu",
        pass: "2BF7F440292C25B9BDF9750A00C7F628CC98"
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
