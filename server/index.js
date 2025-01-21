require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const templateRoutes = require('./routers/template.route');

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();
  
// Middleware
app.use(cors());
// Increase payload size limit to 50mb
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Image upload endpoint
app.post('/api/uploadImage', async (req, res) => {
  try {
    const fileStr = req.body.data;
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'email_builder'
    });
    res.json({ imageUrl: uploadResponse.secure_url });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// Routes
const authRoutes = require('./routers/auth.route');
const emailBuilderRoutes = require('./routers/emailBuilder.route');

app.use('/api/auth', authRoutes);
app.use('/api/templates', emailBuilderRoutes);
app.use('/api/templates', templateRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 