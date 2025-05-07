const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (base64Data, folder = "uploads") => {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Image upload failed");
  }
};

module.exports = uploadToCloudinary;
