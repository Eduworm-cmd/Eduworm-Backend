const mongoose = require('mongoose');

const LevelModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Level', LevelModel);
