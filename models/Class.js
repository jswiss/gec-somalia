const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names
const slug = require('slugs');
const timestamps = require('mongoose-timestamp');

const classSchema = new mongoose.Schema({
  code: {
    type: String,
    trim: true,
    enum: [],
  },
  school: {
    type: mongoose.Schema.ObjectId,
    ref: 'School',
    required: 'Every class must have a school!',
  },
});

classSchema.plugin(timestamps);

// Pre-save hook in MongoDB to auto create a slug
classSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running
  }
  // this requires a real function
  this.slug = slug(`${this.school}_${this.code}`);
  // check if the slug is unique
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)`, 'i');
  const classWithSlug = await this.constructor.find({ slug: slugRegex });
  if (classWithSlug.length) {
    this.slug = `${this.slug}-${classWithSlug.length + 1}`;
  }
  // remember 'next()' for middleware!
  next();
  // TODO: Make more resilient so slugs are unique
});

module.exports = mongoose.model('Class', classSchema);
