const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names
const slug = require('slugs');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  slug: String,
  school: {
    type: mongoose.Schema.ObjectId,
    ref: 'School',
    required: true,
  },
  class: {
    type: mongo.Schema.ObjectId,
    ref: 'Class',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  gender: {
    type: String,
    trim: true,
    required: true,
    enum: ['male', 'female'],
  },
  birthdate: Date,
  fatherName: {
    type: String,
    trim: true,
    lowercase: true,
  },
  motherName: {
    type: String,
    trim: true,
    lowercase: true,
  },
  homeVillage: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  attendance: [{
    date: Date,
    attended: Boolean,
  }],
  bursarySupport: Boolean,
  paymentDates: [{
    date: Date,
    amount: Number,
  }],
  timestamps: [{
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }],
});

// Pre-save hook in MongoDB to auto create a slug
studentSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running
  }
  // this requires a real function
  this.slug = slug(`${this.school}_${this.class}_${this.initials}`);
  // check if the slug is unique
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)`, 'i');
  const studentWithSlug = await this.constructor.find({ slug: slugRegex });
  if (studentWithSlug.length) {
    this.slug = `${this.slug}-${studentWithSlug.length + 1}`;
  }
  // remember 'next()' for middleware!
  next();
  // TODO: Make more resilient so slugs are unique
});

module.exports = mongoose.model('Student', studentSchema);
