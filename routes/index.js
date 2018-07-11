const express = require('express')
const router = express.Router()

/**
  GET method for '/' that takes in a cb
  req = object of data coming in
  res = object full of methods of sending data back to user
 */
router.get('/', (req, res) => {
  // const t = { name: 'T', age: 25, cool: true }
  // res.send('Hey! It works!')
  // res.json(t)
  res.send(req.query) // req.query allows us to get query params from URL
})

router.get('/reverse/:name', (req, res) => {
  // :name = URL parameter called name
  const reverse = [...req.params.name].reverse().join('')
  res.send(reverse)
})

module.exports = router
