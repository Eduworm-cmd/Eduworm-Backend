const Content = require('../models/ContentModel');
const cloudinary = require("../config/cloudinary");

exports.createContent = async (req, res) => {
    try {
        let previewImageUrl = "";

        if (req.body.previewImageBuffer) {
            const previewImageBuffer = req.body.previewImageBuffer;

            const uploadResponse = await cloudinary.uploader.upload(
                `data:image/png;base64,${previewImageBuffer}`,
                { folder: "content_previews" }
            );

            previewImageUrl = uploadResponse.secure_url; // Get the URL of the uploaded image
        }

        const content = new Content({
            ...req.body,
            previewImage: previewImageUrl // Save the preview image URL
        });

        await content.save();
        res.status(201).json(content);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update Content
exports.updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = { ...req.body };

        if (req.body.previewImageBuffer) {
            const previewImageBuffer = req.body.previewImageBuffer;

            const uploadResponse = await cloudinary.uploader.upload(
                `data:image/png;base64,${previewImageBuffer}`,
                { folder: "content_previews" }
            );

            updatedData.previewImage = uploadResponse.secure_url;
        }

        const content = await Content.findByIdAndUpdate(id, updatedData, { new: true });

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        // Respond with the updated content
        res.status(200).json(content);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Get All Contents
exports.getAllContents = async (req, res) => {
    try {
        const contents = await Content.find();
        res.status(200).json(contents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Content by ID
exports.getContentById = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) return res.status(404).json({ message: 'Content not found' });
        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Content


// Delete Content
exports.deleteContent = async (req, res) => {
    try {
        const content = await Content.findByIdAndDelete(req.params.id);
        if (!content) return res.status(404).json({ message: 'Content not found' });
        res.status(200).json({ message: 'Content deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
