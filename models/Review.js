const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now(),
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author.',
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'You must supply a store.',
  },
  text: {
    type: String,
    required: 'You must enter a review.',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
})

/**
 * Auto populates author field when review is queried
 *
 * @param {Function} next Calls next middleware
 */
function autoPopulate(next) {
  this.populate('author')
  next()
}

// Add hooks to run autoPopulate() when we query using find or findOne
reviewSchema.pre('find', autoPopulate)
reviewSchema.pre('findOne', autoPopulate)

module.exports = mongoose.model('Review', reviewSchema)
