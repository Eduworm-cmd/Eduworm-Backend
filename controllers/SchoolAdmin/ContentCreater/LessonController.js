const DayModel = require("../../../models/SchoolAdmin/ContentCreateModels/DayModel");
const LessonModel = require("../../../models/SchoolAdmin/ContentCreateModels/LessonModel");
const UnitModel = require("../../../models/SchoolAdmin/ContentCreateModels/UnitModel");
const classModel = require("../../../models/SuperAdmin/classModel");
const cloudinary = require("../../../config/cloudinary");


const LessonCreate = async (req, res) => {
    try {
        const {
            dayId,
            ClassId,
            UnitId,
            lessonAvatar,
            title,
            subjectType,
            duration,
            objectives, // raw array: [title1, value1, title2, value2, ...]
            interactiveActivity,
        } = req.body;

        console.log('Received lesson data:', {
            dayId,
            ClassId,
            UnitId,
            title,
            subjectType,
            duration,
            lessonAvatarExists: !!lessonAvatar,
            lessonAvatarType: typeof lessonAvatar,
            lessonAvatarLength: lessonAvatar ? lessonAvatar.length : 0
        });

        // Validate required fields
        if (!dayId || !ClassId || !UnitId || !title || !duration) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if lessonAvatar exists
        if (!lessonAvatar) {
            return res.status(400).json({ error: "Lesson avatar is required" });
        }

        // Validate existence
        const [foundClass, foundUnit, foundDay] = await Promise.all([
            classModel.findById(ClassId),
            UnitModel.findById(UnitId),
            DayModel.findById(dayId),
        ]);

        if (!foundClass) return res.status(404).json({ error: "Class not found" });
        if (!foundUnit) return res.status(404).json({ error: "Unit not found" });
        if (!foundDay) return res.status(404).json({ error: "Day not found" });

        // Upload avatar
        let lessonAvatarUrl = "";
        if (lessonAvatar && lessonAvatar.length > 50) {
            const uploadSource = lessonAvatar.startsWith("data:image/")
                ? lessonAvatar
                : lessonAvatar.startsWith("http")
                    ? lessonAvatar
                    : `data:image/png;base64,${lessonAvatar}`;

            try {
                const uploadResponse = await cloudinary.uploader.upload(uploadSource, {
                    folder: "Lesson Avatars",
                });
                lessonAvatarUrl = uploadResponse.secure_url;
            } catch (uploadError) {
                console.error("Avatar upload failed:", uploadError);
                return res.status(400).json({ error: "Failed to upload avatar image", details: uploadError.message });
            }
        } else {
            return res.status(400).json({ error: "Invalid or missing lesson avatar" });
        }

        // Convert flat objectives array to array of objects
        if (!Array.isArray(objectives) || objectives.length % 2 !== 0) {
            return res.status(400).json({ error: "Objectives must be a flat array with even number of items [title, value, ...]" });
        }

        if (interactiveActivity && !Array.isArray(interactiveActivity)) {
            return res.status(400).json({ error: "Interactive activity must be an array of objects" });
        }

        const formattedObjectives = [];
        for (let i = 0; i < objectives.length; i += 2) {
            formattedObjectives.push({
                objectiveTitle: objectives[i],  // Changed from 'objective' to 'objectiveTitle'
                objectiveValue: objectives[i + 1],  // Changed from 'editorValue' to 'objectiveValue'
            });
        }

        // Format interactive activities and handle poster uploads if needed
        const formattedInteractiveActivity = await Promise.all((interactiveActivity || []).map(async (activity) => {
            let posterUrl = null;

            // Process poster image if it exists
            if (activity.poster && activity.poster.length > 50) {
                try {
                    const uploadSource = activity.poster.startsWith("data:image/")
                        ? activity.poster
                        : activity.poster.startsWith("http")
                            ? activity.poster
                            : `data:image/png;base64,${activity.poster}`;

                    const uploadResponse = await cloudinary.uploader.upload(uploadSource, {
                        folder: "Activity Posters",
                    });
                    posterUrl = uploadResponse.secure_url;
                } catch (uploadError) {
                    console.error("Poster upload failed:", uploadError);
                    // Continue without poster if upload fails
                }
            }

            return {
                title: activity.title || '',
                link: activity.link || '',
                poster: posterUrl
            };
        }));

        // Save lesson - match all required fields in your schema
        const newLesson = new LessonModel({
            dayId,
            ClassId,
            UnitId,
            lessonAvatar: lessonAvatarUrl,
            lessonTitle: title,  // Changed from 'title' to 'lessonTitle'
            subjectType,
            duration,
            objectives: formattedObjectives,
            interactiveActivity: formattedInteractiveActivity,
        });

        await newLesson.save();

        return res.status(201).json({
            success: true,
            message: "Lesson created successfully",
            data: newLesson,
        });
    } catch (error) {
        console.error("Lesson creation failed:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

module.exports = { LessonCreate };
  
const GetLessonsByDay = async (req, res) =>{
    try {
        const {dayId} = req.params;
        const lessons = await LessonModel.find({dayId});
        if(!lessons)
         return res.status(404).json({error:"Lessons not found"});
        res.status(200).json({success:true,data:lessons});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getLessonsAll = async (req, res) => {
    try {
        const lessons = await LessonModel.find();
        if (!lessons) {
            return res.status(404).json({ error: "Lessons not found" });
        }
        res.status(200).json({ success: true, data: lessons });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
    LessonCreate,
    GetLessonsByDay,
    getLessonsAll
}