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

/**
 * Returns top instances of stores by reviews (at least 2 or more reviews)
 * - Queries reviews with relationship store _id === review.store
 * - Only returns instances with 2 or more reviews
 * - Adds averageRating property to instance -> average of reviews rating
 * - Sorts by averageRating in descending order
 * - Limits to 10 instances (stores) at most
 *
 * @returns Top instances of stores by average rating of reviews in descending order
 */
storeSchema.statics.getTopStores = function() {
  // aggregate is lower level mongoDB and not mongoose so can't use virtual fields
  return this.aggregate([
    // Lookup Stores and populate their reviews
    // from: 'reviews' is from mongoDB it will lowercase model name and add an s in the end
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews',
      },
    },
    // Filter for only items that have 2 or more reviews
    // 'reviews.1' = second item in reviews exists -> .1 is index (starts at 0)
    { $match: { 'reviews.1': { $exists: true } } },
    // Add the average reviews field
    {
      $addFields: {
        // $ means data being piped in (i.e from $match in this case)
        averageRating: { $avg: '$reviews.rating' },
      },
    },
    // sort it by our new field, highest reviews first
    { $sort: { averageRating: -1 } },
    // limit to at most 10
    { $limit: 10 },
  ])
}

// Find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
  ref: 'Review', // Model to reference (i.e link)
  localField: '_id', // Field on the Store model
  foreignField: 'store', // Field on the Review model
})

/**
 * Auto populates reviews field when store is queried
 *
 * @param {Function} next Calls next middleware
 */
function autoPopulate(next) {
  this.populate('reviews')
  next()
}

// Add hooks to run autoPopulate() when we querying using find or findOne
storeSchema.pre('find', autoPopulate)
storeSchema.pre('findOne', autoPopulate)

module.exports = mongoose.model('Store', storeSchema)
