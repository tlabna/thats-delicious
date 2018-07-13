const mongoose = require('mongoose')
const { Schema } = mongoose
mongoose.Promise = global.Promise
const md5 = require('md5')
const validator = require('validator')
const mongodbErrorHandler = require('mongoose-mongodb-errors')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please enter an email address',
  },
  name: {
    type: String,
    required: 'Please enter a name',
    trim: true,
  },
})

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' })
userSchema.plugin(mongodbErrorHandler) // Use these errors instead of ugly mongoDB

module.exports = mongoose.model('User', userSchema)
