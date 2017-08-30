const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names

const ragSchema = new mongoose.Schema({
	school: {
		type: mongoose.Schema.ObjectId,
		ref: 'School',
		required: 'Every class must have a school!',
	},
	rating: String,
	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Rag', ragSchema);
