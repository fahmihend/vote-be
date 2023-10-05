const express = require('express');
const router = express.Router();
const indexController = require('../controller/app.controller');
const { authenticateJWT, isAdmin } = require('../middleware/auth.middleware');

router.post('/login', indexController.login);

// admin routes
router.post('/register', authenticateJWT, isAdmin, indexController.register);
router.post('/user-list', authenticateJWT, isAdmin, indexController.userList);
router.post('/result-vote', authenticateJWT, isAdmin, indexController.voteResult);

// user routes
router.post('/add-vote', authenticateJWT, indexController.addVote);

module.exports = router;
