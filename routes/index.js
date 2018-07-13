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
  getStoresByTag,
} = require('../controllers/storeController')
const {
  loginForm,
  registerForm,
  validateRegister,
  register,
} = require('../controllers/userController')
const { login } = require('../controllers/authController')
const { catchErrors } = require('../handlers/errorHandlers')

router.get('/', catchErrors(getStores))
router.get('/stores', catchErrors(getStores))
router.get('/add', addStore)
router.post('/add', upload, catchErrors(resize), catchErrors(createStore))
router.post('/add/:id', upload, catchErrors(resize), catchErrors(updateStore))
router.get('/stores/:id/edit', catchErrors(editStore))
router.get('/store/:slug', catchErrors(getStoreBySlug))
router.get('/tags', catchErrors(getStoresByTag))
router.get('/tags/:tag', catchErrors(getStoresByTag))
router.get('/login', loginForm)
router.get('/register', registerForm)

// 1. Validate the registration data
// 2. Register the user
// 3. Login user
router.post('/register', validateRegister, register, login)

module.exports = router
