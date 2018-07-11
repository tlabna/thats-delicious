const express = require('express')
const router = express.Router()
const storeController = require('../controllers/storeController')

/**
  GET method for '/' that takes in a cb
  req = object of data coming in
  res = object full of methods of sending data back to user
 */
router.get('/', storeController.homePage)

router.get('/reverse/:name', (req, res) => {
  // :name = URL parameter called name
  const reverse = [...req.params.name].reverse().join('')
  res.send(reverse)
})

module.exports = router
