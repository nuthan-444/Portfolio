import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure cloudinary dynamically using env vars passed from CF Workers context.
 * We re-configure on each call because Workers don't have a persistent global env.
 */
const getCloudinary = (cloudName, apiKey, apiSecret) => {
  cloudinary.config({
    cloud_name: cloudName || 'demo',
    api_key: apiKey || '123456789',
    api_secret: apiSecret || 'secret',
  });
  return cloudinary;
};

/* ── Images only (for project thumbnails) ─────────────────── */
export const uploadToCloudinary = async (
  fileBuffer,
  folder = 'portfolio_projects',
  cloudName,
  apiKey,
  apiSecret
) => {
  try {
    if (!cloudName || cloudName === 'demo') {
      const base64 = fileBuffer.toString('base64');
      return {
        url: `data:image/jpeg;base64,${base64}`,
        publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      };
    }

    const cld = getCloudinary(cloudName, apiKey, apiSecret);

    return new Promise((resolve, reject) => {
      const stream = cld.uploader.upload_stream(
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
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      stream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    const base64 = fileBuffer.toString('base64');
    return { url: `data:image/jpeg;base64,${base64}`, publicId: `fallback_${Date.now()}` };
  }
};

/* ── Images OR PDFs (resource_type: 'auto') ───────────────── */
export const uploadFileToCloudinary = async (
  fileBuffer,
  originalName,
  folder = 'portfolio_request_files',
  cloudName,
  apiKey,
  apiSecret
) => {
  if (!cloudName || cloudName === 'demo') {
    return { url: null, publicId: `local_${Date.now()}`, originalName, resourceType: 'raw' };
  }

  const cld = getCloudinary(cloudName, apiKey, apiSecret);

  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: `${Date.now()}_${originalName.replace(/\s+/g, '_')}`,
        use_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          originalName,
          resourceType: result.resource_type,
        });
      }
    );
    stream.end(fileBuffer);
  });
};

/* ── Delete from Cloudinary ───────────────────────────────── */
export const deleteFromCloudinary = async (
  publicId,
  resourceType = 'image',
  cloudName,
  apiKey,
  apiSecret
) => {
  if (!publicId || publicId.startsWith('local_') || publicId.startsWith('fallback_')) return true;
  try {
    const cld = getCloudinary(cloudName, apiKey, apiSecret);
    await cld.uploader.destroy(publicId, { resource_type: resourceType });
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    return false;
  }
};

export default cloudinary;
