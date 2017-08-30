require('dotenv').config({ path: __dirname + '/../variables.env' });
const fs = require('fs');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

// import all of our models - they need to be imported only once
const School = require('../models/School');
// const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Input = require('../models/Input');

const schools = JSON.parse(
	fs.readFileSync(__dirname + '/school-data.json', 'utf-8')
);
const students = JSON.parse(
	fs.readFileSync(__dirname + '/student-data.json', 'utf-8')
);
// const users = JSON.parse(fs.readFileSync(__dirname + '/user-data.json', 'utf-8'));
const inputs = JSON.parse(
	fs.readFileSync(__dirname + '/input-data.json', 'utf-8')
);
const teachers = JSON.parse(
	fs.readFileSync(__dirname + '/teacher-data.json', 'utf-8')
);

async function deleteData() {
	console.log('😢😢 Goodbye Data...');
	await School.remove();
	// await User.remove();
	await Student.remove();
	await Teacher.remove();
	await Input.remove();
	console.log(
		'Data Deleted. To load sample data, run\n\n\t npm run sample\n\n'
	);
	process.exit();
}

async function loadData() {
	try {
		await School.insertMany(schools);
		// await User.insertMany(users);
		await Student.insertMany(students);
		await Teacher.insertMany(teachers);
		await Input.insertMany(inputs);
		console.log('👍👍👍👍👍👍👍👍 Done!');
		process.exit();
	} catch (e) {
		console.log(
			'\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n'
		);
		console.log(e);
		process.exit();
	}
}
if (process.argv.includes('--delete')) {
	deleteData();
} else {
	loadData();
}
