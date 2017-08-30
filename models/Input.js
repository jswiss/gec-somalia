const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names
const slug = require('slugs');
const timestamps = require('mongoose-timestamp');

const inputSchema = new mongoose.Schema({
	author,
	date,
	school,
	teacher,
	student,
	inputType,
	description,
	// how to compare?
});

inputSchema.plugin(timestamps);

module.exports = mongoose.model('Input', inputSchema);
