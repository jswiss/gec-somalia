const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names
const slug = require('slugs');
const timestamps = require('mongoose-timestamp');

const teacherSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		lowercase: true,
		required: true,
	},
	headTeacher: {
		type: Boolean,
		required: true,
	},
	// Checkboxes for this
	subjects: [String],
	slug: String,
	dynamic: [
		{
			year: { type: Number, required: true },
			attendance: [
				{
					date: Date,
					attended: Boolean,
				},
			],
		},
	],
	school: {
		type: mongoose.Schema.ObjectId,
		ref: 'School',
		required: true,
	},
	form: [String],
	gender: {
		type: String,
		trim: true,
		required: true,
		enum: ['M', 'F'],
	},
	birthdate: Date,
	attendance: [
		{
			date: Date,
			attended: Boolean,
		},
	],
	highestEducation: {
		type: String,
	},
	// put project support tags here
	tags: [String],
});

teacherSchema.plugin(timestamps);

// Pre-save hook in MongoDB to auto create a slug
teacherSchema.pre('save', async function(next) {
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

teacherSchema.statics.getTagsList = function() {
	// no arrow function so we can access 'this'
	return this.aggregate([
		{ $unwind: '$tags' }, // $ in front of tags says it is a field in the document
		{ $group: { _id: '$tags', count: { $sum: 1 } } }, // adding new count field when grouping
		{ $sort: { count: 1 } },
	]);
};

module.exports = mongoose.model('Teacher', teacherSchema);
