const cloudinary = require("../config/cloudinary");

const uploadMulterToCloudinary = async (file, folder) => {
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!file || !file.buffer) {
      return reject(new Error('Missing file or file buffer'));
    }

    if (!folder) {
      return reject(new Error('Destination folder must be specified'));
    }

    // Create data URI from buffer
    try {
      // Check if buffer is actually a Buffer object
      if (!Buffer.isBuffer(file.buffer)) {
        // If it's not a Buffer, try to convert it to one
        file.buffer = Buffer.from(file.buffer);
      }
      
      const base64Data = file.buffer.toString('base64');
      const dataURI = `data:${file.mimetype || 'application/octet-stream'};base64,${base64Data}`;
      
      // Upload to Cloudinary
      cloudinary.uploader.upload(
        dataURI, 
        { 
          folder,
          resource_type: "auto" // Allow Cloudinary to detect file type automatically
        }, 
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(new Error(`Image upload failed: ${error.message}`));
          }
          
          if (!result || !result.secure_url) {
            return reject(new Error('Upload completed but no URL was received'));
          }
          
          resolve(result.secure_url);
        }
      );
    } catch (err) {
      console.error('Error preparing file for upload:', err);
      reject(new Error(`Failed to prepare file for upload: ${err.message}`));
    }
  });
};

module.exports = uploadMulterToCloudinary;
