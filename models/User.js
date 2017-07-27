const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// bug in mongoose that will give false positives if this is not included
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');
const shortId = require('shortid');
const timestamps = require('mongoose-timestamp');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email address'], // how to validate, and what error to throw if not validation
    required: 'Please supply an email address'
  },
  shortId: {
    type: String,
    'default': shortId.generate,
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  organisation: {
    type: String,
    enum: ['GEC', 'SOMGEP', 'EGEP', 'Government'],
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'editor', 'viewer'],
  },
});

userSchema.plugin(timestamps);

userSchema.virtual('gravatar').get(function() {
  // using a proper function to access this!
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
