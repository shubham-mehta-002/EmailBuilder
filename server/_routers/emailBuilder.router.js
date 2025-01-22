const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getEmailLayout,uploadImage,uploadEmailConfig,renderAndDownloadTemplate } = require('../_controllers/emailBuilder.controller');

router.use(auth);

router.get('/getEmailLayout', getEmailLayout);
router.post('/uploadImage', uploadImage)
router.post('/uploadEmailConfig',uploadEmailConfig)
router.post('renderAndDownloadTemplate', renderAndDownloadTemplate)


module.exports = router
