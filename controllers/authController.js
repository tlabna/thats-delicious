const passport = require('passport')

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
