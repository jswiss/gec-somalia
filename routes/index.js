const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/school.controller');
const formController = require('../controllers/form.controller');
// const userController = require('../controllers/user.controller');
// const authController = require('../controllers/auth.controller');
const studentController = require('../controllers/student.controller');
const teacherController = require('../controllers/teacher.controller');

// if you don't wrap async/await in try/catch, has to be wrapped in error
// handling function
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(schoolController.getSchools));
router.get('/schools', catchErrors(schoolController.getSchools));
router.get('/school/:slug', catchErrors(schoolController.getSchoolBySlug));

// Add/edit school and sub docs
router.get('/add', schoolController.addSchool);
router.post(
	'/add',
	schoolController.upload,
	catchErrors(schoolController.resize),
	catchErrors(schoolController.createSchool)
);

router.get('/schools/:id/edit', catchErrors(schoolController.editSchool));

// map
router.get('/map', schoolController.mapPage);

// API Endpoints
router.get('/api/v1/search', catchErrors(schoolController.searchSchools));
router.get('/api/v1/schools/map', catchErrors(schoolController.mapSchools));

// Form stuff
router.post('/forms/:id', catchErrors(formController.addForm));

// Teacher stuff
router.post('/teachers/:id', catchErrors(formController.addTeacher));

// TODO: Student stuff
router.get(
	'/school/:slug/form/:form/students/:date',
	catchErrors(studentController.getStudents)
);

module.exports = router;
