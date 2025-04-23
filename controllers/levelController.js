const Level = require('../models/levelModel');

// Create Level
exports.createLevel = async (req, res) => {
    try {
        const newLevel = new Level(req.body);
        await newLevel.save();
        res.status(201).json(newLevel);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get All Levels
exports.getAllLevels = async (req, res) => {
    try {
        const levels = await Level.find();
        res.json(levels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Single Level by ID
exports.getLevelById = async (req, res) => {
    try {
        const level = await Level.findById(req.params.id);
        if (!level) return res.status(404).json({ error: "Level not found" });
        res.json(level);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Level
exports.updateLevel = async (req, res) => {
    try {
        const updatedLevel = await Level.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedLevel) return res.status(404).json({ error: "Level not found" });
        res.json(updatedLevel);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete Level
exports.deleteLevel = async (req, res) => {
    try {
        const deletedLevel = await Level.findByIdAndDelete(req.params.id);
        if (!deletedLevel) return res.status(404).json({ error: "Level not found" });
        res.json({ message: "Level deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
