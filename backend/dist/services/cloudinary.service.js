"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary instance
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
    api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret',
});
const uploadImage = (buffer, folder = 'lost-found') => {
    return new Promise((resolve, reject) => {
        // If dynamic cloud credentials are placeholder defaults, return a mock URL to prevent crash
        if (!process.env.CLOUDINARY_CLOUD_NAME ||
            process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
            console.log('Cloudinary Service: Mocking upload of buffer image due to default/missing credentials');
            resolve(`https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80`);
            return;
        }
        cloudinary_1.v2.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) => {
            if (err) {
                console.error('Cloudinary upload error:', err.message || err);
                console.log('Falling back to a placeholder image due to Cloudinary error.');
                resolve(`https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80`);
            }
            else {
                resolve(result.secure_url);
            }
        }).end(buffer);
    });
};
exports.uploadImage = uploadImage;
const deleteImage = async (publicId) => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME ||
            process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
            console.log(`Cloudinary Service: Mocking deletion of publicId: ${publicId}`);
            return;
        }
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        console.error('Cloudinary deletion error:', error);
    }
};
exports.deleteImage = deleteImage;
