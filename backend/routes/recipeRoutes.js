const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const recipeController = require('../controllers/recipeController');

// @route   POST /api/recipes/generate
// @desc    Genereer gepersonaliseerde recepten
// @access  Private
router.post('/generate', auth, recipeController.generateRecipes);

module.exports = router;
