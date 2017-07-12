const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names
const slug = require('slugs');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a school name', // defaults to true, and this acts as the error msg
  },
  slug: String,
  // project activities here
  tags: [String],
  // TODO: create an enum list for allowable tags
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [
      {
        type: Number,
        required: 'You must provide coordinates!'
      }
    ],
  },
  headTeacher: String, //TODO: Edit this so it's a ref to Teacher.js
  teachers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Teacher'
  }],
  classes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
  }],
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
  }],
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author',
  }
});

// MongoDB indexing always happens in Schema
schoolSchema.index({
  name: 'text', // we tell MongoDB what we'd like to index fields as. in this case, 'text'
  // location: '2dsphere'
});

// index location
schoolSchema.index({
  location: '2dsphere'
});  

// Pre-save hook in MongoDB to auto create a slug
schoolSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running
  }
  // this requires a real function
  this.slug = slug(this.name);
  // check if the slug is unique
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)`, 'i');
  const schoolsWithSlug = await this.constructor.find({ slug: slugRegex });
  if (schoolsWithSlug.length) {
    this.slug = `${this.slug}-${schoolsWithSlug.length + 1}`;
  }
  // remember 'next()' for middleware!
  next();
  // TODO: Make more resilient so slugs are unique
});

//aggregator
schoolSchema.statics.getTagsList = function () {
  // no arrow function so we can access 'this'
  return this.aggregate([
    { $unwind: '$tags' }, // $ in front of tags says it is a field in the document
    { $group: { _id: '$tags', count: { $sum: 1 } } }, // adding new count field when grouping
    { $sort: { count: 1 } }
  ]);
}

module.exports = mongoose.model('School', schoolSchema);
