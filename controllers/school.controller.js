const mongoose = require('mongoose');
const School = mongoose.model('School');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter: function(req, file, next) {
		// file's mimetype tells you the type of file
		const isPhoto = file.mimetype.startsWith('image/');
		if (isPhoto) {
			next(null, true);
		} else {
			next({ message: "That file type isn't allowed" }, false);
		}
	},
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
	if (!req.file) {
		next(); // skip to the next middleware if there is no file.
		return;
	}
	const extension = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extension}`;
	// now we resize
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);
	// once we have written the photo to our filesystem, keep going!
	next();
};

exports.getSchools = async (req, res) => {
	// TODO: Query the db for a list of all stores
	const schools = await School.find();
	// res.json(schools);
	res.render('schools', {
		title: 'Schools',
		schools,
	});
};

exports.getSchoolBySlug = async (req, res, next) => {
	const school = await School.findOne({ slug: req.params.slug });
	// const school = await findOne({ slug: req.params.slug }).populate('classes');
	// res.json(school);
	if (!school) {
		next();
		return;
	}
	res.render('school', { school, title: school.name });
};

exports.mapSchools = async (req, res) => {
	const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
	const q = {
		location: {
			$near: {
				$geometry: {
					type: 'Point',
					coordinates: coordinates,
				},
				$maxDistance: 1000000, // 1000 km
			},
		},
	};
	const schools = await School.find(q).select(
		'slug name location rag photo project'
	);
};

// API search
exports.searchSchools = async (req, res) => {
	const schools = await School.find(
		{
			// $text is a MongoDB operator that searches all fields indexed as text
			$text: {
				$search: req.query.q,
			},
		},
		{
			//projecting, i.e. creating a new field, score, made up of metadata
			score: { $meta: 'textScore' }, // textScore is the only meta field in MongoDB so far
		}
	)
		// we want to sort by higher textScore
		.sort({
			score: { $meta: 'textScore' },
		})
		// limit to only five results
		.limit(10);
	res.json(schools);
};

exports.addSchool = (req, res) => {
	res.render('editSchool', { title: 'Add School' });
};

const confirmOwner = (school, user) => {
	if (!school.author.equals(user._id)) {
		throw Error('You must be a head teacher of a school or admin to edit it');
	}
};

exports.editSchool = async (req, res) => {
	// 1. Find the store given the ID
	const school = await School.findOne({ _id: req.params.id });

	// confirmOwner(school, req.user);
	// 3. Render out the edit form so the user can update their store
	res.render('editSchool', {
		title: `Edit ${school.name}`,
		school,
	});
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
	if (!req.file) {
		next(); // skip to the next middleware if there is no file.
		return;
	}
	const extension = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extension}`;
	// now we resize
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);
	// once we have written the photo to our filesystem, keep going!
	next();
};

// use ASYNC any time we query the database
exports.createSchool = async (req, res) => {
	// req.body.author = req.user._id;
	const school = await new School(req.body).save();
	req.flash(
		'success',
		`successfully created ${school.name}! Want to add teacher, class, and student info?`
	);
	res.redirect(`/school/${school.slug}`);
};

exports.mapPage = (req, res) => {
	res.render('map', { title: 'Map' });
};
