const nodemailer = require('nodemailer')
const pug = require('pug')
const juice = require('juice') // inlines CSS in html
const htmlToText = require('html-to-text')
const promisify = require('es6-promisify')

// set up different ways how we handle email -> smtp in this case
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

/**
 * Generates HTML to be sent by nodemailer
 *
 * @param {String} filename Pug template to render
 * @param {Object} [options={}] Data that will be sent in email
 * @returns Generated HTML text with CSS inlined
 */
const generateHTML = (filename, options = {}) => {
  // create html from pug template
  const html = pug.renderFile(
    `${__dirname}/../views/email/${filename}.pug`,
    options
  )

  // inline css to html so it works on older browsers
  const inlined = juice(html)

  return inlined
}

/**
 * Sends user an email
 *
 * @param {Object} options Data needed to send in email
 * @returns Function invocation of nodemailer transport.sendMail(mailOptions)
 */
exports.send = async (options) => {
  const html = generateHTML(options.filename, options)
  const text = htmlToText.fromString(html)

  const mailOptions = {
    from: `That's Delicious <noreply@thats-delicious.com`,
    to: options.user.email,
    subject: options.subject,
    html,
    text,
  }

  // promisify sendMail method (since it's call back based)
  const sendMail = promisify(transport.sendMail, transport)

  return sendMail(mailOptions)
}
