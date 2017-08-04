const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names
const slug = require('slugs');
const timestamps = require('mongoose-timestamp');

const schoolSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: 'Please enter a school name', // defaults to true, and this acts as the error msg
		},
		code: {
			type: String,
			trim: true,
			required: 'Every school needs a unique code!',
		},
		slug: String,
		project: {
			type: String,
			required: 'Every school must have a project',
			enum: ['SOMGEP', 'EGEP'],
		},
		rag: [
			{
				date: {
					type: Date,
					default: Date.now,
				},
				rating: {
					type: String,
					enum: ['red', 'amber', 'green'],
				},
			},
		],
		// project activities here
		tags: [String],
		// TODO: create an enum list for allowable tags
		created: {
			type: Date,
			default: Date.now,
		},
		location: {
			type: {
				type: String,
				default: 'Point',
			},
			village: {
				type: String,
				trim: true,
				required: 'You must provide a village!',
			},
			district: {
				type: String,
				trim: true,
				required: 'You must provide a district!',
			},
			region: {
				type: String,
				trim: true,
				required: 'You must provide a region!',
			},
			state: {
				type: String,
				trim: true,
				required: 'You must provide a state!',
			},
			coordinates: [
				{
					type: Number,
					required: 'You must provide coordinates!',
				},
			],
		},
		photo: String,
	},
	{
		// makes virtuals accessible as JSON or objects
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

schoolSchema.plugin(timestamps);

// MongoDB indexing always happens in Schema
schoolSchema.index({
	name: 'text', // we tell MongoDB what we'd like to index fields as. in this case, 'text'
	project: 'text',
	rag: 'text',
});

schoolSchema.index({
	'location.village': 'text',
});

// index location
schoolSchema.index({
	location: '2dsphere',
});

// Pre-save hook in MongoDB to auto create a slug
schoolSchema.pre('save', async function(next) {
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
schoolSchema.statics.getTagsList = function() {
	// no arrow function so we can access 'this'
	return this.aggregate([
		{ $unwind: '$tags' }, // $ in front of tags says it is a field in the document
		{ $group: { _id: '$tags', count: { $sum: 1 } } }, // adding new count field when grouping
		{ $sort: { count: 1 } },
	]);
};

schoolSchema.virtual('forms', {
	// mongoose to query Form model
	ref: 'Form',
	// find matching school _id and school field in Review
	localField: '_id',
	foreignField: 'school',
});

function autopopulate(next) {
	this.populate('forms');
	// this.populate('students');
	// this.populate('teachers');
	next();
}

schoolSchema.pre('find', autopopulate);
schoolSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('School', schoolSchema);
