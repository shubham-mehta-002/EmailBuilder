const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const {
    getTemplatesByUser,
    createTemplate,
    getTemplateById,
    uploadEmailConfig,
    renderAndDownloadTemplate,
    getEmailLayout,
    uploadImage

} = require('../controllers/template.controller');

// All routes are protected with auth middleware
router.use(auth);

// Get all templates for logged in user
router.get('/user', getTemplatesByUser);

// Create new template
router.post('/create', createTemplate);

router.put('/uploadEmailConfig/:id', uploadEmailConfig);

router.get('/renderAndDownloadTemplate/:id/download', renderAndDownloadTemplate);

router.get('/getEmailLayout', getEmailLayout);

router.post('/uploadImage', uploadImage)

// Get specific template
router.get('/:id',getTemplateById);

module.exports = router