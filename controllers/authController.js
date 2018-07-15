const passport = require('passport')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const crypto = require('crypto') // built in node.js module to provide creating hash
const promisify = require('es6-promisify')
const mail = require('../handlers/mail')

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed to login.',
  successRedirect: '/',
  successFlash: 'You are now logged in.',
})

exports.logout = (req, res) => {
  // passport.js logout() func
  req.logout()
  req.flash('success', 'You are now logged out.')
  res.redirect('/')
}

exports.isLoggedIn = (req, res, next) => {
  // 1. check if the user is authenticated
  // passport.js isAuthenticated() func
  if (req.isAuthenticated()) {
    next() // carry on since they are logged in
    return
  }

  req.flash('error', 'You must be logged in to do that.')
  res.redirect('/')
}

/**
 * Sends user a password reset link.
 * If user exists, a password reset link is sent with an expiry limit (1hr)
 * and then user is redirected to /login.
 * Note. If user does not exist, they will receive the same message that a link
 * has been sent. (for security and privacy reasons)
 *
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
exports.forgot = async (req, res) => {
  // 1. Check if user exists
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    // For security reasons and privacy
    req.flash('info', 'A password reset has been mailed to you.')
    return res.redirect('/login')
  }

  // 2. Set reset token and expiry on user account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
  user.resetPasswordExpires = Date.now() + 3600000 // 1 hour from now
  await user.save()

  // 3. Send user an email with the token
  const resetUrl = `http://${req.headers.host}/account/reset/${
    user.resetPasswordToken
  }`
  await mail.send({
    user,
    subject: 'Password Reset',
    resetUrl,
    filename: 'password-reset', // when we render html, we'll look for password-reset.pug file
  })
  req.flash('success', 'A password reset has been mailed to you.')

  // 4. redirect to login page
  res.redirect('/login')
}

/**
 * Displays reset form to user (if reset link is valid)
 * i.e. resetPasswordToken matches and is within resetPasswordExpires time
 *
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
exports.reset = async (req, res) => {
  // Find user by token in URL param (supplied in reset link)
  // and if they're within the expiry limit
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    // Checks if expiry time is greater than now (i.e. not in the past)
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired.')
    return res.redirect('/login')
  }

  // if checks pass and user exists -> show the reset password form
  res.render('reset', { title: 'Reset Password' })
}

/**
 * Checks that both user submitted passwords match
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @param {Function} next calls the next middleware
 */
exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next() // keep going -> updatePassword()
    return
  }

  // If passwords don't match -> flash error and redirect back to reset form
  req.flash('error', 'Passwords do not match.')
  res.redirect('back')
}

/**
 * Updates user submitted password from user reset link.
 *
 * @param {Object} req request object
 * @param {Object} res response object
 */
exports.updatePassword = async (req, res) => {
  // Before updating password
  // check if we have the same user (from token)
  // and if they're within the expiry limit
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired.')
    return res.redirect('/login')
  }

  // turn setPassword() (from passport-local-mongoose)
  // to promise since it is callback based
  const setPassword = promisify(user.setPassword, user)

  // set updated user password (passport.js does this for us)
  await setPassword(req.body.password)

  // reset token and expiry back to undefined
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined

  // Save the changed fields for token and expiry or else they're just staged
  const updatedUser = await user.save()

  // login user with updated password (using passport.js login())
  await req.login(updatedUser)

  req.flash('success', 'Your password has been reset! You are now logged in.')
  res.redirect('/')
}
