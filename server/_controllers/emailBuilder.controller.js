const getEmailLayout = async (req, res) => {
    let layout = await fs.readFile('./templates/layout.html', 'utf8');
    res.setHeader('Content-Type', "text/html"); 
    res.status(200).send(layout);
};

const uploadImage = async (req, res) => {
    try {
        let imageBase64 = req.body.logoUrl;
        if (!imageBase64) {
            return res.status(400).json({ success:false ,message: 'No image data provided' });
        }
        
        const url = await uploadToCloudinary(imageBase64);
      
          return res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: url
          });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Image upload failed' });
    }
}

const uploadEmailConfig = async(req, res) => {
    try {
        let base64Image = req.body.logoUrl;
        
        if (!base64Image) { 
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }  

        const logoUrl = await uploadToCloudinary(base64Image);

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
            imageUrl: req.body.imageUrl ? req.body.imageUrl : [],
            logoUrl 
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
}

const renderAndDownloadTemplate = async (req, res) => {
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
            .replace('{{titleText}}', template.title.value)
            .replace('{{titleColor}}', template.title.textColor)
            .replace('{{titleFontSize}}', getFontSize(template.title.fontSize))
            .replace('{{titleAlignment}}', template.title.alignment)
            
            // Content section
            .replace('{{contentText}}', template.context.value)
            .replace('{{contentColor}}', template.context.textColor)
            .replace('{{contentFontSize}}', getFontSize(template.context.fontSize))
            .replace('{{contentAlignment}}', template.context.alignment)
            
            // Footer section
            .replace('{{footerText}}', template.footer.value)
            .replace('{{footerColor}}', template.footer.textColor)
            .replace('{{footerFontSize}}', getFontSize(template.footer.fontSize))
            .replace('{{footerAlignment}}', template.footer.alignment)

            .replace('{{templateName}}', template.templateName);

        // Set response headers
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${template.templateName}.html"`);
        
        // Send the generated HTML
        res.send(htmlContent);
    } catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({ message: 'Error generating template' });
    }
}



const uploadToCloudinary = async (imageBase64) => {
    try{
        const uploadResult = await cloudinary.uploader.upload(imageBase64, {
            resource_type: 'image',
            folder: 'email_builder'
        });
        return uploadResult.secure_url;
    }catch(error){
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

module.exports = {
    getEmailLayout,
    uploadImage,
    uploadEmailConfig,
    renderAndDownloadTemplate
};  
