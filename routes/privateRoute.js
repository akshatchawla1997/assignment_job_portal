const express = require('express');
const JobsController = require('../controllers/JobsController');
const router = express.Router();

router.get('/api/jobs', JobsController.getAllJobs);
router.post('/api/jobs', JobsController.createNewJob);
router.put('/api/jobs', JobsController.updateJob);
router.delete('/api/jobs/:id', JobsController.deleteJob);
router.get('/api/recruiter/:userId', JobsController.getJobsByRecruiter);
router.post('/api/apply', JobsController.applyJob);

module.exports = router;