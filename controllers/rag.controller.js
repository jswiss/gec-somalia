const mongoose = require('mongoose');
const Rag = mongoose.model('Rag');

exports.addRag = async (req, res) => {
	req.body.author = req.user._id;
	req.body.schools = req.params.id;
	const newRag = new Rag(req.body);
	await newRag.save();
	req.flash('success', 'RAG Rating saved!');
	res.redirect('back');
};
