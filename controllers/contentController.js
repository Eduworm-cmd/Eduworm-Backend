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

            previewImageUrl = uploadResponse.secure_url; 
        }

        const content = new Content({
            ...req.body,
            previewImage: previewImageUrl
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
exports.getContentByGrade= async (req, res) => {
    try {
      const { gradeId } = req.params;
      
      // Validate that gradeId is a valid ObjectId
      if (!gradeId || !require('mongoose').Types.ObjectId.isValid(gradeId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid grade ID format' 
        });
      }
  
      // Find all content items with the specified grade ID
      const contentItems = await Content.find({ grade: gradeId })
        .populate('grade', 'name level') // Optionally populate grade details
        .sort({ createdAt: -1 }); // Sort by newest first
      
      if (contentItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No content found for this grade'
        });
      }
  
      return res.status(200).json({
        success: true,
        count: contentItems.length,
        data: contentItems
      });
    } catch (error) {
      console.error('Error fetching content by grade:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }