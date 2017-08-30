const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names
const slug = require('slugs');
const timestamps = require('mongoose-timestamp');

const schoolSchema = new mongoose.Schema(
	{
		markerColor: String,
		// timestamps: true,
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
		forms: [
			{
				type: String,
				required: true,
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
					'p1-a',
					'p2-a',
					'p3-a',
					'p4-a',
					'p5-a',
					'p6-a',
					'p7-a',
					'p8-a',
					's1-a',
					's2-a',
					's3-a',
					's4-a',
					'p1-b',
					'p2-b',
					'p3-b',
					'p4-b',
					'p5-b',
					'p6-b',
					'p7-b',
					'p8-b',
					's1-b',
					's2-b',
					's3-b',
					's4-b',
					'p1-c',
					'p2-c',
					'p3-c',
					'p4-c',
					'p5-c',
					'p6-c',
					'p7-c',
					'p8-c',
					's1-c',
					's2-c',
					's3-c',
					's4-c',
					'p1-d',
					'p2-d',
					'p3-d',
					'p4-d',
					'p5-d',
					'p6-d',
					'p7-d',
					'p8-d',
					's1-d',
					's2-d',
					's3-d',
					's4-d',
					'p1-e',
					'p2-e',
					'p3-e',
					'p4-e',
					'p5-e',
					'p6-e',
					'p7-e',
					'p8-e',
					's1-e',
					's2-e',
					's3-e',
					's4-e',
				],
			},
		],
		slug: String,
		project: {
			type: String,
			required: 'Every school must have a project',
			enum: ['SOMGEP', 'EGEP'],
		},
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
			coordinates: [
				{
					type: Number,
					required: 'You must provide coordinates!',
				},
			],
		},
		photo: String,
		type: {
			type: String,
			required: 'every school needs a type!',
			enum: ['Primary', 'Secondary'],
		},
		rag: [
			{
				date: {
					type: Date,
					default: Date.now,
				},
				rating: String,
			},
		],
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
	const latestRating = this.rag[this.rag.length - 1].rating;
	if (latestRating === 'Orange') {
		this.markerColor = `http://maps.google.com/mapfiles/ms/icons/orange-dot.png`;
	} else {
		this.markerColor = `http://maps.google.com/mapfiles/ms/icons/${latestRating}-dot.png`.toLowerCase();
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

schoolSchema.pre('update', async function(next) {
	const latestRating = this.rag[this.rat.length - 1].rating;
	if (latestRating === 'Orange') {
		this.markerColor = `http://maps.google.com/mapfiles/ms/icons/orange-dot.png`;
	} else {
		this.markerColor = `http://maps.google.com/mapfiles/ms/icons/${latestRating}-dot.png`.toLowerCase();
	}
	next();
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

schoolSchema.virtual('teachers', {
	ref: 'Teacher',
	localField: '_id',
	foreignField: 'school',
});

schoolSchema.virtual('students', {
	ref: 'Student',
	localField: '_id',
	foreignField: 'currentSchool',
});

schoolSchema.virtual('inputs', {
	ref: 'Input',
	localField: '_id',
	foreignField: 'school',
});

function autopopulate(next) {
	this.populate('students');
	this.populate('teachers');
	this.populate('inputs');
	next();
}

schoolSchema.pre('find', autopopulate);
schoolSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('School', schoolSchema);
