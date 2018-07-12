const express = require('express')
const router = express.Router()
const {
  addStore,
  createStore,
  editStore,
  getStores,
  updateStore,
  upload,
  resize,
  getStoreBySlug,
} = require('../controllers/storeController')
const { catchErrors } = require('../handlers/errorHandlers')

router.get('/', catchErrors(getStores))
router.get('/stores', catchErrors(getStores))
router.get('/add', addStore)
router.post('/add', upload, catchErrors(resize), catchErrors(createStore))
router.post('/add/:id', upload, catchErrors(resize), catchErrors(updateStore))
router.get('/stores/:id/edit', catchErrors(editStore))
router.get('/store/:slug', catchErrors(getStoreBySlug))

module.exports = router
