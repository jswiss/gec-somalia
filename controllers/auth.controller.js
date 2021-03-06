const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Failed Login!',
	successRedirect: '/',
	successFlash: 'You are now logged in!',
});

exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You are now logged out 👋!');
	res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
	// check if user is authenticated
	if (req.isAuthenticated()) {
		next(); // carry on!
		return;
	}
	req.flash('error', 'Oops! You must be logged in to do that!');
	res.redirect('/login');
};

exports.forgot = async (req, res) => {
	// 1. see if user exists
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		req.flash('error', 'A password reset has been mailed to you.');
		return res.redirect('/login');
	}
	// 2. set reset tokens and expiry on account
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 360000; // 1 hour till expires
	await user.save();
	// 3. send an email with the token
	const resetURL = `http://${req.headers
		.host}/account/reset/${user.resetPasswordToken}`;
	await mail.send({
		user,
		filename: 'password-reset',
		subject: 'Password Reset',
		resetURL,
	});
	req.flash('success', 'You have been emailed a password reset link');
	// 4. redirect to login after email token has been sent
	res.redirect('/login');
};

exports.reset = async (req, res) => {
	// is there someone with this token, and is this token still valid?
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }, // tells mongodb to look at dates 'greater than' now
	});
	if (!user) {
		req.flash('error', 'Password reset token is invalid or has expired');
		return res.redirect('/login');
	}
	// if there is a user, show the reset password form
	res.render('reset', { title: 'Reset your password' });
};

exports.confirmedPasswords = (req, res, next) => {
	if (req.body.password === req.body['password-confirm']) {
		next(); // keep it going
	}
	req.flash('error', "Your passwords don't match");
	res.redirect('back');
};

exports.update = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }, // tells mongodb to look at dates 'greater than' now
	});
	if (!user) {
		req.flash('error', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}
	const setPassword = promisify(user.setPassword, user);
	await setPassword(req.body.password);
	// now we need to get rid of the extra fields
	// in mongodb, setting fields to undefined removes them
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	const updatedUser = await user.save();
	await req.login(updatedUser);
	req.flash('success', 'Nice! 💃 Your password has been reset!');
	res.redirect('/');
};
