const express = require('express')
const router = express.Router()
const {
  addStore,
  createStore,
  getStores,
} = require('../controllers/storeController')
const { catchErrors } = require('../handlers/errorHandlers')

router.get('/', catchErrors(getStores))
router.get('/stores', catchErrors(getStores))
router.get('/add', addStore)
router.post('/add', catchErrors(createStore))

module.exports = router
