const mongoose = require('mongoose')
const slug = require('slugs')

mongoose.Promise = global.Promise

const storeSchema = new mongoose.Schema(
  {
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
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: 'You must supply an author',
    },
  },
  // We add this option because by default virtual fields are not included when
  // asking for object or JSON of instance. It's there but you don't see it
  // You can either explicitly ask for it -> ex. store.reviews
  // Or add the option below, so when we ask for Object or JSON they will be included
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Define our indexes
storeSchema.index({
  name: 'text',
  description: 'text',
})

storeSchema.index({
  location: '2dsphere', // Create a geo-spatial index for location
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

storeSchema.statics.getTagsList = function() {
  // 1. unwind - get each instance of tag (for multiple tags in one instance)
  // it'll return multiple instances of the same object but with each tag
  // 2. group all instances by id: tag + add count prop and add 1 each time for same tag
  // 3. sort in descending order
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])
}

// Find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
  ref: 'Review', // Model to reference (i.e link)
  localField: '_id', // Field on the Store model
  foreignField: 'store', // Field on the Review model
})

module.exports = mongoose.model('Store', storeSchema)
