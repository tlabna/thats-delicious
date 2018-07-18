const mongoose = require('mongoose')
const Review = mongoose.model('Review')

/**
 * Adds a user submitted review to Review model.
 *
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
exports.addReview = async (req, res) => {
  // Add author and store to req.body
  req.body.author = req.user._id
  req.body.store = req.params.id

  // Create review and save
  const newReview = new Review(req.body)
  await newReview.save()

  req.flash('success', 'Review saved.')
  res.redirect('back')
}
