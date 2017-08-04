const mongoose = require('mongoose');
const Form = mongoose.model('Form');

exports.addForm = async (req, res) => {
	req.body.school = req.params.id;
	const newForm = new Form(req.body);
	await newForm.save();
	req.flash('success', 'Form saved!');
	res.redirect('back');
};
