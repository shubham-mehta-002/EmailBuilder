const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getTemplatesByUser,
    createTemplate,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    downloadTemplate
} = require('../controllers/template.controller');

// All routes are protected with auth middleware
router.use(auth);

// Get all templates for logged in user
router.get('/user', getTemplatesByUser);

// Create new template
router.post('/create', createTemplate);

// Get specific template
router.get('/:id', getTemplateById);

// Update template
router.put('/:id', updateTemplate);

// Delete template
router.delete('/:id', deleteTemplate);

// Download template as HTML
router.get('/:id/download', downloadTemplate);

module.exports = router; 