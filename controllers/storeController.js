const mongoose = require('mongoose')
const Store = mongoose.model('Store')

/**
  req = object of data coming in
  res = object full of methods of sending data back to user
 */
exports.homePage = (req, res) => {
  res.render('index')
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' })
}

exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save()
  req.flash(
    'success',
    `Successfully Created ${store.name}. Care to leave a review?`
  )
  res.redirect(`/store/${store.slug}`)
}
