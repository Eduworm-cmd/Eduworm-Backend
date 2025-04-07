const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    thumbnail: { type: String, required: true },
    description: { type: String, required: true },
    gamePath: { type: String, required: true },
});

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    thumbnail: { type: String, required: true },
    description: { type: String, required: true },
    videoLocation: { type: String, required: true },
});

const course_curriculumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
});

const courseContentSchema = new mongoose.Schema({
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    type: { type: String, required: true, enum: ["curriculum", "video", "game"] },
    course_data: [
        {
            item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'course_data.type' },
            type: { type: String, required: true, enum: ['Course_Curriculum', 'Video', 'Game'] }
        }
    ]
});

const CourseContent = mongoose.model('CourseContent', courseContentSchema);
const Course_Curriculum = mongoose.model('Course_Curriculum', course_curriculumSchema);
const Video = mongoose.model('Video', videoSchema);
const Game = mongoose.model('Game', gameSchema);

module.exports = { CourseContent, Course_Curriculum, Video, Game };
