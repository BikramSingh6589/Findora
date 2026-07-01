import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret',
});

export const uploadImage = (buffer: Buffer, folder = 'lost-found'): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If dynamic cloud credentials are placeholder defaults, return a mock URL to prevent crash
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name'
    ) {
      console.log('Cloudinary Service: Mocking upload of buffer image due to default/missing credentials');
      resolve(`https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80`);
      return;
    }

    cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) => {
      if (err) reject(err);
      else resolve(result!.secure_url);
    }).end(buffer);
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name'
    ) {
      console.log(`Cloudinary Service: Mocking deletion of publicId: ${publicId}`);
      return;
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
  }
};
