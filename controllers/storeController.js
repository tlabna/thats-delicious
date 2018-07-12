const mongoose = require('mongoose')
const Store = mongoose.model('Store')
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

exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save()
  req.flash(
    'success',
    `Successfully Created ${store.name}. Care to leave a review?`
  )
  res.redirect(`/store/${store.slug}`)
}

exports.getStores = async (req, res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find()

  res.render('stores', { title: 'Stores', stores })
}

exports.editStore = async (req, res) => {
  // 1. Find the store given an ID
  const store = await Store.findOne({ _id: req.params.id })
  // 2. Confirm they are the owner of the store
  // TODO
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
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${
      store.slug
    }">View Store</a>`
  )
  // redirect to store and flash that update worked
  res.redirect(`/stores/${store._id}/edit`)
}

exports.getStoreBySlug = async (req, res, next) => {
  // 1. Find the store by slug
  const store = await Store.findOne({ slug: req.params.slug })
  // 2. render out the store layout
  if (!store) return next()
  res.render('store', { store, title: store.title })
}

exports.getStoresByTag = async (req, res) => {
  const tags = await Store.getTagsList()
  const { tag } = req.params
  res.render('tags', { tags, title: 'Tags', tag })
}
