const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Profile CRUD
router.post('/', profileController.createProfile);
router.get('/', profileController.getProfiles);
router.get('/:id', profileController.getProfileById);
router.put('/:id', profileController.updateProfile);
router.delete('/:id', profileController.deleteProfile);

// Profile actions
router.post('/:id/generate', profileController.generateQuestionsAndCompetitors);
router.post('/:id/analyze', profileController.runAnalysis);

module.exports = router;

