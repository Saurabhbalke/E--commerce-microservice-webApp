const express = require('express');
const router = express.Router();
const { register, login, profile } = require('../controllers/userController');
// const auth = require('../middlewares/auth'); // We can add auth middleware later

// Routes based on your original file
router.post('/register', register);
router.post('/login', login);
// router.get('/profile', auth, profile); // Add middleware later

// Health check
router.get('/health', (req, res) => res.send('User service OK'));

module.exports = router;