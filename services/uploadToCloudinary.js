const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (base64Data, folder = "uploads") => {
  try {
    // Make sure base64Data has the correct format
    if (!base64Data.startsWith('data:image')) {
      throw new Error('Invalid base64 image format');
    }

    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    if (error.response) {
      console.error("Cloudinary Response Error:", error.response.body);
    }
    throw new Error("Image upload failed");
  }
};


module.exports = uploadToCloudinary;
