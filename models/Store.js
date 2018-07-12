const mongoose = require('mongoose')
const slug = require('slugs')

mongoose.Promise = global.Promise

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!',
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [
      {
        type: Number,
        required: 'You must supply coordinates!',
      },
    ],
    address: {
      type: String,
      required: 'You must enter an address!',
    },
  },
  photo: String,
})

// Things to do pre save
storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next() // skip
    return // stop function from running
  }
  this.slug = slug(this.name)

  // find other stores that have the same slug and make sure they are unique
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
  // this.constructor = Store -> So we can access Store in model itself
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx })
  // if slug exists and others with - then edit slug with incremented number after -
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`
  }

  next()
})

module.exports = mongoose.model('Store', storeSchema)
