const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names
const timestamps = require('mongoose-timestamp');

const inputSchema = new mongoose.Schema({
	author: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'An author must be supplied',
	},
	date: {
		type: Date,
		default: Date.now,
	},
	school: {
		type: mongoose.Schema.ObjectId,
		ref: 'School',
		required: 'A school must be supplied',
	},
	teacher: {
		type: mongoose.Schema.ObjectId,
		ref: 'Teacher',
	},
	student: {
		type: mongoose.Schema.ObjectId,
		ref: 'Student',
	},
	inputType: {
		type: String,
		required: 'An input type must be provided',
	},
	quantitySent: {
		type: Number,
		required: 'Please provide a quantity',
	},
	valueSent: {
		type: Number,
		required: 'Please provide an estimated monetary value in GBP',
	},
	description: {
		type: String,
		required: 'Please provide a description for this input',
	},
	dispatched: {
		type: String,
		enum: ['yes', 'no'],
		default: 'no',
	},
	received: {
		type: String,
		enum: ['yes', 'no'],
		default: 'no',
	},
	quantityReceived: Number,
	valueReceived: Number,
	receiverComments: String,
});

inputSchema.plugin(timestamps);

module.exports = mongoose.model('Input', inputSchema);
