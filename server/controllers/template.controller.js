const Template = require('../models/template.model');
const User = require('../models/user.model');
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const path = require('path');

const getTemplatesByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        if(!userId){
            return res.status(400).json({
                success: false,
                message: `User id is required`
            });
        }

        const user = await User.findById(userId)
            .populate({
                path: 'templates',
                options: { sort: { createdAt: -1 } }
            });

        if(!user){
            return res.status(400).json({
                success: false,
                message: `User not found`
            });
        }

        res.json({ templates: user.templates });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ success: false, message: 'Error fetching templates' });
    }
};

const createTemplate = async (req, res) => {
    try {
        const userId = req.user.id;
        if(!userId) {
            return res.status(400).json({
                success: false,
                message: `User id is required`
            });
        }

        const user = await User.findById(userId);
        if(!user) {
            return res.status(400).json({
                success: false,
                message: `User not found`
            });
        }

        // Create new template - mongoose will use schema defaults
        const template = new Template({ userId });
        await template.save();
        
        // Add template to user's templates array
        user.templates.push(template._id);
        await user.save();

        res.status(201).json({
            success: true,
            template
        });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating template',
            error: error.message 
        });
    }
};

const getTemplateById = async (req, res) => {
    try {
        const template = await Template.findOne({
            _id: req.params.id,
            userId: req.user.id
        })

        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        console.log({template});
        res.json({template});
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ success: false, message: 'Error fetching template' });
    }
};

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (base64Image) => {
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: 'email_builder'
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

const updateTemplate = async (req, res) => {
    try {
        let logoUrl = req.body.logoUrl;
        console.log({logoUrl});
        // If logoUrl is a base64 string (new image), upload to Cloudinary
        if (logoUrl && logoUrl.startsWith('data:image')) {
            logoUrl = await uploadToCloudinary(logoUrl);
            console.log({logoUrl});
        }

        const updateData = {
            templateName: req.body.templateName,
            title: {
                value: req.body.title?.value,
                fontSize: req.body.title?.fontSize,
                textColor: req.body.title?.textColor,
                alignment: req.body.title?.alignment
            },
            context: {
                value: req.body.context?.value,
                fontSize: req.body.context?.fontSize,
                textColor: req.body.context?.textColor,
                alignment: req.body.context?.alignment
            },
            footer: {
                value: req.body.footer?.value,
                fontSize: req.body.footer?.fontSize,
                textColor: req.body.footer?.textColor,
                alignment: req.body.footer?.alignment
            },
            imageUrl: req.body.imageUrl,
            logoUrl // Use the Cloudinary URL if uploaded, or existing URL
        };

        const template = await Template.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.id
            },
            updateData,
            { new: true }
        );

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json({ template });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ message: 'Error updating template' });
    }
};

const deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ message: 'Error deleting template' });
    }
};

const downloadTemplate = async (req, res) => {
    try {
        const template = await Template.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Read the layout HTML file
        const layoutPath = path.join(__dirname, '../templates/layout.html');
        let htmlContent = await fs.readFile(layoutPath, 'utf8');

        // Replace placeholders with template data
        htmlContent = htmlContent
            // Logo
            .replace('{{logoUrl}}', template.logoUrl || '')
            
            // Title section
            .replace('{{titleContent}}', template.title.value)
            .replace('{{titleColor}}', template.title.textColor)
            .replace('{{titleFontSize}}', getFontSize(template.title.fontSize))
            .replace('{{titleAlignment}}', template.title.alignment)
            
            // Content section
            .replace('{{contentText}}', template.context.value)
            .replace('{{contentColor}}', template.context.textColor)
            .replace('{{contentFontSize}}', getFontSize(template.context.fontSize))
            .replace('{{contentAlignment}}', template.context.alignment)
            
            // Footer section
            .replace('{{footerContent}}', template.footer.value)
            .replace('{{footerColor}}', template.footer.textColor)
            .replace('{{footerFontSize}}', getFontSize(template.footer.fontSize))
            .replace('{{footerAlignment}}', template.footer.alignment);

        // Set response headers
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${template.templateName}.html"`);
        
        // Send the generated HTML
        res.send(htmlContent);
    } catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({ message: 'Error generating template' });
    }
};

// Helper function to convert fontSize values to actual CSS values
const getFontSize = (size) => {
    switch (size) {
        case 'sm': return '0.875rem';
        case 'md': return '1rem';
        case 'lg': return '1.25rem';
        default: return '1rem';
    }
};

module.exports = {
    getTemplatesByUser,
    createTemplate,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    downloadTemplate
}; 