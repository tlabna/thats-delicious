const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const User = mongoose.model('User')
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/')
    if (isPhoto) {
      next(null, true)
    } else {
      next({ message: `That filetype isn't allowed!` }, false)
    }
  },
}

/**
  req = object of data coming in
  res = object full of methods of sending data back to user
 */
exports.homePage = (req, res) => {
  res.render('index')
}

exports.upload = multer(multerOptions).single('photo')

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next() // skip to the next middleware
    return
  }

  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`

  // resize photo
  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`./public/uploads/${req.body.photo}`)

  // One we've written the photo to our filesystem, keep going
  next()
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' })
}

/**
 * Creates a Store from user submitted data in store form.
 *
 * @param {Object} req Request object
 * @param {Object} res Response Object
 */
exports.createStore = async (req, res) => {
  req.body.author = req.user._id // Add logged in user (id) to author
  const store = await new Store(req.body).save()
  req.flash(
    'success',
    `Successfully Created ${store.name}. Care to leave a review?`
  )
  res.redirect(`/store/${store.slug}`)
}

/**
 * Renders stores template view
 * - Queries db for stores, returns stores depending on constraints of limit and skip
 * - stores query is sorted by created timestamp in descending order
 * - limit = # of stores to return, skip = skip stores from start of list of stores
 * - counts total number of stores in db
 * - protects route if a page does not exists
 *
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
exports.getStores = async (req, res) => {
  // Get page number or 1 for homepage
  const page = req.params.page || 1

  // Max number of stores per page
  const limit = 6

  // Skips the number of store from start (ex. page 2 we skip 4 (first 4 stores))
  const skip = page * limit - limit

  // 1. Query the database for a list of all stores
  const storesPromise = Store.find()
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' }) // sort by created timestamp in descending order

  // 2. Count the total number of documents (instances) of Store
  const countPromise = Store.count()

  // Launch both promises and await
  const [stores, count] = await Promise.all([storesPromise, countPromise])

  // get upper bound of # of pages
  const pages = Math.ceil(count / limit)

  // Protect route if pages change
  // (i.e. user bookmarked page 20 but that doesn't exists anymore)
  if (!stores.length && skip) {
    req.flash(
      'info',
      `You asked for page ${page}, however, that doesn't exist anymore...
      So I've redirected you to page ${pages}`
    )

    res.redirect(`/stores/page/${pages}`)
    return
  }

  res.render('stores', { title: 'Stores', stores, page, pages, count })
}

/**
 * Checks if user is owner of the store
 *
 * @param {Object} store Store object
 * @param {Object} user User object
 */
const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it.')
  }
}

exports.editStore = async (req, res) => {
  // 1. Find the store given an ID
  const store = await Store.findOne({ _id: req.params.id })

  // 2. Confirm they are the owner of the store
  confirmOwner(store, req.user)

  // 3. Render out the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store })
}

exports.updateStore = async (req, res) => {
  // set location data to have type of point
  // Why? When updating the defaults don't trigger in
  req.body.location.type = 'Point'

  // find and update the store
  // findOneAndUpdate(q, data, options)
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true, // force model to run validators
  }).exec() // exec() make sure query to run

  req.flash(
    'success',
    `Successfully updated <strong>${store.name}</strong>. <a href="/store/${
      store.slug
    }">View Store</a>`
  )
  // redirect to store and flash that update worked
  res.redirect(`/stores/${store._id}/edit`)
}

/**
 * Queries DB for store by slug and renders store page if it exists
 *
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Function} next Next middleware function
 * @returns Renders store view or calls next middleware function
 */
exports.getStoreBySlug = async (req, res, next) => {
  // 1. Find the store by slug
  // populate the author field with user data
  // populate the reviews virtual field with review data
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    'author reviews'
  )

  // 2. render out the store layout
  if (!store) return next()
  res.render('store', { store, title: store.name })
}

exports.getStoresByTag = async (req, res) => {
  const { tag } = req.params
  // tagQuery = specific tag or every single tag
  const tagQuery = tag || { $exists: true, $ne: [] }
  const tagsPromise = Store.getTagsList()
  const storesPromise = Store.find({ tags: tagQuery })
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise])

  res.render('tags', { tags, title: 'Tags', tag, stores })
}

/**
 * Returns JSON response of stores matching query q
 * (ex. /api/search?q=coffee)
 *
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
exports.searchStores = async (req, res) => {
  const stores = await Store.find(
    // first find stores that match
    {
      $text: {
        $search: req.query.q,
      },
    },
    {
      // project (i.e. add) a score field with number of times we find the query
      // text in store object. This way we can order query by textScore
      score: { $meta: 'textScore' },
    }
  )
    // then sort in descending order
    .sort({ score: { $meta: 'textScore' } })
    // limit to only 5 store
    .limit(5)

  res.json(stores)
}

/**
 * Returns JSON response of stores within 10km radius from query lat/lng
 * - Fields returns = slug, name, description and location
 * - Limited to 10 stores per request
 *
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat)
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: 10000, // 10km
      },
    },
  }
  // .select(specifies which document fields to include)
  const stores = await Store.find(q)
    .select('slug name description location photo')
    .limit(10)
  res.json(stores)
}

/**
 * Renders map view
 *
 * @param {Object} req Request Object
 * @param {Object} res Response Object
 */
exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' })
}

/**
 * Returns JSON response of User object with updated User hearts from a POST request.
 * - URL: POST -> /api/stores/:id/hearts
 * - Toggles between:
 *  1. Adding store ID to user hearts set (if store hasn't been hearted)
 *  2. Removing store ID from user hearts set (if store has been hearted before)
 *
 * @param {Object} req Request Object
 * @param {Object} res Response Object
 */
exports.heartStore = async (req, res) => {
  // Get list of user hearts
  const hearts = req.user.hearts.map((obj) => obj.toString())

  // Check if store has been hearted by user. True then remove else add to set
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet'
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      [operator]: { hearts: req.params.id },
    },
    { new: true } // Will tell mongoDB to return the updated user, !(initial query result)
  )

  res.json(user)
}

/**
 * Renders hearts view
 *
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    // query by _id and check that id is in req.user.hearts array
    _id: { $in: req.user.hearts },
  })

  res.render('stores', { title: 'Hearted Stores', stores })
}

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores()

  res.render('topStores', { title: '⭐ Top Stores', stores })
}
