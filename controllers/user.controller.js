const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
	res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
	res.render('register', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
	// from express validator, which has different validation methods
	req.sanitizeBody('name');
	req.checkBody('name', 'You must provide a name!').notEmpty();
	req
		.checkBody('email', 'That email is not valid!')
		.notEmpty()
		.isEmail();
	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extension: false,
		gmail_remove_subaddress: false,
	});
	req.checkBody('password', 'Password cannot be blank!').notEmpty();
	req
		.checkBody('password-confirm', 'Confirmed Password cannot be blank!')
		.notEmpty();
	req
		.checkBody('password-confirm', 'Oops! Your passwords do not match!')
		.equals(req.body.password);

	const errors = req.validationErrors();
	if (errors) {
		req.flash('error', errors.map(err => err.msg));
		res.render('register', {
			title: 'Register',
			body: req.body,
			flashes: req.flash(),
		});
		return; // stop the function from running
	}
	next(); // there were no errors, proceed to next middleware
};

// next because its middleware, no need for next when it is the ending function
exports.register = async (req, res, next) => {
	const user = new User({ email: req.body.email, name: req.body.name });
	const register = promisify(User.register, User);
	await register(user, req.body.password);
	next(); // pass to authController.login
};

exports.account = (req, res) => {
	res.render('account', { title: 'Edit Your Account' });
};

exports.updateAccount = async (req, res) => {
	const updates = {
		name: req.body.name,
		email: req.body.email,
	};

	const user = await User.findOneAndUpdate(
		{ _id: req.user._id }, //query
		{ $set: updates }, //updates
		{ new: true, runValidators: true, context: 'query' } //options
	);
	req.flash('success', 'Successfully updated profile!');
	res.redirect('/account');
};
