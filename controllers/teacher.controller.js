const mongoose = require('mongoose');
const Teacher = mongoose.model('Teacher');

exports.addTeacher = async (req, res) => {
	req.body.school = req.params.id;
	const newTeacher = new Form(req.body);
	await newTeacher.save();
	req.flash('success', 'Teacher saved!');
	res.redirect('back');
};
