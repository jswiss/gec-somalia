const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names

const classSchema = new mongoose.Schema({
  code: {
    type: String,
    trim: true,
    enum: [],
  },
  slug: String,
  school: {
    type: mongoose.Schema.ObjectId,
    ref: 'School',
  },
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
  }],
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'Teacher',
  },
});

module.exports = mongoose.model('Class', classSchema);
