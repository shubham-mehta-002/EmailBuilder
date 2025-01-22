require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();
  
// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL
}));

// Increase payload size limit to 50mb
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const authRoutes = require('./routers/auth.router');
const templateRoutes = require('./routers/template.router');

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 