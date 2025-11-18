const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

router.get('/hostaway', reviewsController.getAllReviews);
router.get('/approved', reviewsController.getApprovedReviews);
router.get('/analytics', reviewsController.getAnalytics);
router.post('/selection', reviewsController.updateReviewSelection);

module.exports = router;
