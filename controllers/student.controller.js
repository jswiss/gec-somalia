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

exports.getStudents = async (req, res, next) => {
	// TODO: get all students, queried by school and form, and display as tick boxes
	// TODO: post date from params
	// TODO: Loop through all the student checkboxes
	// TODO: Push new object of date and attendance to all students
};

exports.recordAttendance = async (req, res, next) => {};
