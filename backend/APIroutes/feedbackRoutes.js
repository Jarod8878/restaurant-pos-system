const express = require('express');
const router = express.Router();
const feedbackController = require('../controller/feedbackController');

// Route to submit feedback
router.post('/', feedbackController.submitFeedback);

// Route to get all feedbacks
router.get('/', feedbackController.getAllFeedbacks);

module.exports = router;
