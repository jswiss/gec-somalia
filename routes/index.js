const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/school.controller');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
const studentController = require('../controllers/student.controller');
const teacherController = require('../controllers/teacher.controller');

// if you don't wrap async/await in try/catch, has to be wrapped in error
// handling function
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(schoolController.getSummary));

module.exports = router;
