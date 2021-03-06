const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// allows us to make url-friendly names
const slug = require('slugs');
const timestamps = require('mongoose-timestamp');

const studentSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		lowercase: true,
		required: true,
	},
	initials: String,
	fatherInitials: String,
	motherInitials: String,
	slug: String,
	gender: {
		type: String,
		trim: true,
		required: true,
		enum: ['M', 'F'],
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
	currentlyEnrolled: {
		type: Boolean,
		required: true,
	},
	currentSchool: {
		type: mongoose.Schema.ObjectId,
		ref: 'School',
		required: true,
	},
	bursary: {
		supported: { type: Boolean, required: true },
		paymentDetails: [
			{
				date: Date,
				amount: Number,
			},
		],
	},
	// timestamps: true,
	dynamic: [
		{
			year: { type: Number, required: true, min: 2017, max: 2020 },
			school: {
				type: mongoose.Schema.ObjectId,
				ref: 'School',
				required: true,
			},
			form: String,
			attendance: [
				{
					date: Date,
					attended: Boolean,
				},
			],
		},
	],
});

studentSchema.plugin(timestamps);

// Pre-save hook in MongoDB to auto create a slug
studentSchema.pre('save', async function(next) {
	if (!this.isModified('name')) {
		next(); // skip it
		return; // stop this function from running
	}
	// this requires a real function
	this.initials = this.name
		.match(/\b\w/g)
		.join('')
		.toUpperCase();
	this.fatherInitials = this.fatherName
		.match(/\b\w/g)
		.join('')
		.toUpperCase();
	this.motherInitials = this.motherName
		.match(/\b\w/g)
		.join('')
		.toUpperCase();
	this.slug = slug(
		`${this.birthdate}_${this.initials}_${this.motherInitials}_${this
			.fatherInitials}`
	);
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

studentSchema.virtual('inputs', {
	ref: 'Input',
	localField: '_id',
	foreignField: 'student',
});

// TODO: populate virtuals for inputs

module.exports = mongoose.model('Student', studentSchema);
