const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names
const slug = require('slugs');
const timestamps = require('mongoose-timestamp');

const formSchema = new mongoose.Schema({
	level: {
		type: String,
		trim: true,
		enum: [
			'p1',
			'p2',
			'p3',
			'p4',
			'p5',
			'p6',
			'p7',
			'p8',
			's1',
			's2',
			's3',
			's4',
		],
	},
	code: {
		type: String,
		trim: true,
		// TODO: figure out a way to query the school if there are other classes with same level...
	},
	school: {
		type: mongoose.Schema.ObjectId,
		ref: 'School',
		required: 'Every class must have a school!',
	},
});

formSchema.plugin(timestamps);

// Pre-save hook in MongoDB to auto create a slug
formSchema.pre('save', async function(next) {
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

module.exports = mongoose.model('Form', formSchema);
