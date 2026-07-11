import * as dotenv from 'dotenv';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("Testing Cloudinary with:");
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API_KEY:", process.env.CLOUDINARY_API_KEY ? "***" : "missing");
console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "***" : "missing");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  try {
    const res = await cloudinary.uploader.upload('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80', {
      folder: 'test-folder'
    });
    console.log("Upload SUCCESS! URL:", res.secure_url);
  } catch (err: any) {
    console.error("Upload FAILED:", err.message || err);
  }
}

testUpload();
