const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/getEmailLayout', async (req, res) => {
    try {
        let layout = await fs.readFile('./templates/layout.html', 'utf8');
        layout = layout
                      .replaceAll('{{title}}', "__TITLE__")
                      .replaceAll('{{content}}', "__CONTENT__")
                      .replaceAll('{{footer}}', "__FOOTER__");
        res.setHeader('Content-Type', "text/html");
        console.log(layout)
        res.send(layout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to read layout file' });
    }
});

router.post('/uploadImage', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
});


router.post('/uploadEmailConfig', async (req, res) => {
    try {
        // Here you would typically save to a database
        // For this example, we'll just return a mock response
        const templateId = Date.now().toString();
        res.json({ success: true, templateId });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to save template configuration' });
    }
});

router.post('/renderAndDownloadTemplate', async (req, res) => {
    try {
        const { templateId, data } = req.body;
        
        // Read the base layout
        let layout = await fs.readFile('./templates/layout.html', 'utf8');
        
        // Replace placeholders with actual data
        layout = layout.replace('{{title}}', data.title)
                      .replace('{{content}}', data.content)
                      .replace('{{footer}}', data.footer);
        
        // Handle images if present
        if (data.imageUrls && data.imageUrls.length > 0) {
            // Add image tags as needed
            const imageHtml = data.imageUrls.map(url => `<img src="${url}" alt="Email image">`).join('');
            layout = layout.replace('{{images}}', imageHtml);
        }

        res.json({ success: true, renderedHtml: layout });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to render template' });
    }
});

module.exports = router; 