import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
});

export const uploadToCloudinary = async (fileBuffer, folder = 'portfolio_projects') => {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'demo'
    ) {
      // Fallback data-uri for smooth local development without live Cloudinary keys
      const base64 = fileBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      return {
        url: dataUrl,
        publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1920, height: 1920, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Return base64 data-uri as graceful fallback
    const base64 = fileBuffer.toString('base64');
    return {
      url: `data:image/jpeg;base64,${base64}`,
      publicId: `fallback_${Date.now()}`,
    };
  }
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('local_') || publicId.startsWith('fallback_')) {
    return true;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    return false;
  }
};

export default cloudinary;
