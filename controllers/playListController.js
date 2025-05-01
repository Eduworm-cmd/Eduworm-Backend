const Playlist = require("../models/playListModel");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");

exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, author, grade, contents, schoolId } = req.body;
    
    // Validate required fields
    if (!name || !description || !author || !grade || !schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, description, author, grade and schoolId are required" 
      });
    }

    // Validate schoolId format
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school ID format"
      });
    }

    let thumbnail = {};
    
    // Handle thumbnail upload if available
    if (req.body.thumbnail) {
      const uploadedImage = await cloudinary.uploader.upload(req.body.thumbnail, {
        folder: "playlist-thumbnails",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
      });
      
      thumbnail = {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url
      };
    }

    // Create playlist
    const playlist = await Playlist.create({
      name,
      description,
      author,
      grade,
      schoolId,
      thumbnail,
      contents: contents || [],
      assignedStudents: [],
      assignedClasses: []
    });

    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      data: playlist
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create playlist",
      error: error.message
    });
  }
};

exports.getAllPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate("author", "name")
      .populate("grade", "name")  
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: playlists.length,
      data: playlists
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch playlists",
      error: error.message
    });
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID format"
      });
    }
    
    const playlist = await Playlist.findById(id)
      .populate("author", "name")
      .populate("grade", "name")
      .populate("contents")
      .populate("assignedStudents", "name")
      .populate("assignedClasses", "name");
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: playlist
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch playlist",
      error: error.message
    });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID format"
      });
    }
    
    // Handle thumbnail update if present
    if (updateData.thumbnail) {
      const playlist = await Playlist.findById(id);
      
      // Delete previous thumbnail if exists
      if (playlist && playlist.thumbnail && playlist.thumbnail.public_id) {
        await cloudinary.uploader.destroy(playlist.thumbnail.public_id);
      }
      
      const uploadedImage = await cloudinary.uploader.upload(updateData.thumbnail, {
        folder: "playlist-thumbnails",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
      });
      
      updateData.thumbnail = {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url
      };
    }
    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedPlaylist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Playlist updated successfully",
      data: updatedPlaylist
    });
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update playlist",
      error: error.message
    });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID format"
      });
    }
    
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    // Delete thumbnail from cloudinary if exists
    if (playlist.thumbnail && playlist.thumbnail.public_id) {
      await cloudinary.uploader.destroy(playlist.thumbnail.public_id);
    }
    
    await Playlist.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete playlist",
      error: error.message
    });
  }
};

exports.addContentToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { contentIds } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID format"
      });
    }
    
    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Content IDs array is required"
      });
    }
    
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    // Filter valid content IDs
    const validContentIds = contentIds.filter(contentId => 
      mongoose.Types.ObjectId.isValid(contentId));
    
    // Add new content IDs to playlist
    playlist.contents = [...new Set([...playlist.contents, ...validContentIds])];
    await playlist.save();
    
    res.status(200).json({
      success: true,
      message: "Content added to playlist successfully",
      data: playlist
    });
  } catch (error) {
    console.error("Error adding content to playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add content to playlist",
      error: error.message
    });
  }
};

exports.removeContentFromPlaylist = async (req, res) => {
  try {
    const { id, contentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id) || 
        !mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    // Remove content ID from playlist
    playlist.contents = playlist.contents.filter(
      content => content.toString() !== contentId
    );
    
    await playlist.save();
    
    res.status(200).json({
      success: true,
      message: "Content removed from playlist successfully",
      data: playlist
    });
  } catch (error) {
    console.error("Error removing content from playlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove content from playlist",
      error: error.message
    });
  }
};

exports.assignToStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID format"
      });
    }
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student IDs array is required"
      });
    }
    
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    // Filter valid student IDs
    const validStudentIds = studentIds.filter(studentId => 
      mongoose.Types.ObjectId.isValid(studentId));
    
    // Assign to students
    playlist.assignedStudents = [...new Set([...playlist.assignedStudents, ...validStudentIds])];
    await playlist.save();
    
    res.status(200).json({
      success: true,
      message: "Playlist assigned to students successfully",
      data: playlist
    });
  } catch (error) {
    console.error("Error assigning playlist to students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign playlist to students",
      error: error.message
    });
  }
};

exports.assignToClasses = async (req, res) => {
  try {
    const { id } = req.params;
    const { classIds } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist ID format"
      });
    }
    
    if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Class IDs array is required"
      });
    }
    
    const playlist = await Playlist.findById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    // Filter valid class IDs
    const validClassIds = classIds.filter(classId => 
      mongoose.Types.ObjectId.isValid(classId));
    
    // Assign to classes
    playlist.assignedClasses = [...new Set([...playlist.assignedClasses, ...validClassIds])];
    await playlist.save();
    
    res.status(200).json({
      success: true,
      message: "Playlist assigned to classes successfully",
      data: playlist
    });
  } catch (error) {
    console.error("Error assigning playlist to classes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign playlist to classes",
      error: error.message
    });
  }
};