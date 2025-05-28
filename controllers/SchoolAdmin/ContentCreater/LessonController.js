const DayModel = require("../../../models/SchoolAdmin/ContentCreateModels/DayModel");
const LessonModel = require("../../../models/SchoolAdmin/ContentCreateModels/LessonModel");
const UnitModel = require("../../../models/SchoolAdmin/ContentCreateModels/UnitModel");
const classModel = require("../../../models/SuperAdmin/classModel");
const cloudinary = require("../../../config/cloudinary");
const authSchoolBranchModel = require("../../../models/SuperAdmin/authSchoolBranchModel");
const bookPageContent = require("../../../models/SuperAdmin/BookConetnt/subjectPageContent");
const bookPagesSchema = require("../../../models/SuperAdmin/BookConetnt/SubjectPagesModel");
const { default: mongoose } = require("mongoose");


const LessonCreate = async (req, res) => {
    try {
        const {
            ClassId,
            UnitId,
            dayId,
            title,
            lessonAvatar,
            duration,
            objectives,
            interactiveActivity,
            creationType,
            bookPageId,
        } = req.body;

        if (!['manual', 'book'].includes(creationType)) {
            return res.status(400).json({ error: "Invalid creation type. Must be 'manual' or 'book'" });
        }

        if (!dayId || !ClassId || !UnitId) {
            return res.status(400).json({ error: "ClassId, UnitId, and dayId are required" });
        }

        const [foundClass, foundUnit, foundDay] = await Promise.all([
            classModel.findById(ClassId),
            UnitModel.findById(UnitId),
            DayModel.findById(dayId),
        ]);

        if (!foundClass || !foundUnit || !foundDay) {
            return res.status(404).json({ error: "Class, Unit, or Day not found" });
        }

        let lessonAvatarUrl = "";
        let formattedObjectives = [];
        let formattedInteractiveActivity = [];
        let validBookPageId = null;
        let newLesson;

        if (creationType === 'manual') {
            if (!title || !duration || !lessonAvatar || !objectives) {
                return res.status(400).json({ error: "Missing required fields for manual lesson" });
            }

            // Upload lesson avatar
            if (lessonAvatar.length > 50) {
                try {
                    const uploadSource = lessonAvatar.startsWith("data:image/")
                        ? lessonAvatar
                        : lessonAvatar.startsWith("http")
                            ? lessonAvatar
                            : `data:image/png;base64,${lessonAvatar}`;

                    const uploadResponse = await cloudinary.uploader.upload(uploadSource, {
                        folder: "Lesson Avatars",
                    });
                    lessonAvatarUrl = uploadResponse.secure_url;
                } catch (uploadError) {
                    return res.status(400).json({ error: "Failed to upload avatar image", details: uploadError.message });
                }
            } else {
                return res.status(400).json({ error: "Invalid or missing lesson avatar" });
            }

            // Format objectives
            if (!Array.isArray(objectives) || objectives.length % 2 !== 0) {
                return res.status(400).json({ error: "Objectives must be a flat array [title, value, ...]" });
            }

            for (let i = 0; i < objectives.length; i += 2) {
                formattedObjectives.push({
                    objectiveTitle: objectives[i],
                    objectiveValue: objectives[i + 1],
                });
            }

            // Format interactive activities
            if (interactiveActivity && !Array.isArray(interactiveActivity)) {
                return res.status(400).json({ error: "Interactive activity must be an array" });
            }

            formattedInteractiveActivity = await Promise.all((interactiveActivity || []).map(async (activity) => {
                let posterUrl = null;

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
                        console.error("Poster upload failed:", uploadError.message);
                    }
                }

                return {
                    title: activity.title || '',
                    link: activity.link || '',
                    poster: posterUrl
                };
            }));

            newLesson = new LessonModel({
                dayId,
                ClassId,
                UnitId,
                title,
                contentAvtar: lessonAvatarUrl,
                duration,
                objectives: formattedObjectives,
                interactiveActivity: formattedInteractiveActivity,
                creationType,
            });
        }

        if (creationType === 'book') {
            if (!bookPageId || !mongoose.Types.ObjectId.isValid(bookPageId)) {
                return res.status(400).json({ error: "Valid bookPageId is required for book-based lessons" });
            }

            const bookPageExists = await bookPagesSchema.findById(bookPageId).select('SubjectPageContent');
            if (!bookPageExists) {
                return res.status(404).json({ error: "Book page not found" });
            }

            const bookPageContentExists = await bookPageContent.findById(bookPageExists.SubjectPageContent);
            if (!bookPageContentExists) {
                return res.status(404).json({ error: "Book page content not found" });
            }

            validBookPageId = bookPageContentExists._id;

            const dayExists = await DayModel.findById(dayId)
                .select('week globalDayNumber unitId')
                .populate('unitId', 'name');

            if (!dayExists) {
                return res.status(404).json({ error: "Day not found" });
            }

            // Push schedule
            await bookPageContent.findByIdAndUpdate(
                validBookPageId,
                {
                    $push: {
                        shcedule: {
                            unit: dayExists.unitId?.name || null,
                            week: dayExists.week,
                            day: dayExists.globalDayNumber,
                            day_id: dayExists._id
                        }
                    }
                }
            );

            // Create lesson from book content
            newLesson = new LessonModel({
                dayId,
                ClassId,
                UnitId,
                title: bookPageContentExists.title,
                contentAvtar: bookPageContentExists.contentAvtar,
                duration: bookPageContentExists.duration,
                objectives: bookPageContentExists.objectives,
                interactiveActivity: bookPageContentExists.interactiveActivity,
                creationType,
                bookPageId: validBookPageId,
            });
        }

        await newLesson.save();

        await DayModel.findByIdAndUpdate(dayId, {
            $push: { lessons: newLesson._id }
        });

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



const GetLessonsByDay = async (req, res) => {
    try {
        const { dayId } = req.params;
        console.log("Fetching lessons for dayId:", dayId);

        if (!dayId) {
            return res.status(400).json({ success: false, message: "dayId is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(dayId)) {
            return res.status(400).json({ success: false, message: "Invalid dayId format" });
        }

        const lessons = await LessonModel.find({ dayId });

        if (lessons.length === 0) {
            return res.status(404).json({ success: false, message: "No lessons found for this dayId" });
        }

        res.status(200).json({ success: true, data: lessons });

    } catch (error) {
        console.error("Error fetching lessons:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", details: error.message });
    }
};








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

const getLessonById = async (req, res) => {
    try {
        const { lessonId } = req.params;
        if (!lessonId) {
            return res.status(400).json({ error: "Lesson ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({ error: "Invalid Lesson ID" });
        }
        const lessons = await LessonModel.findById(lessonId);
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
    getLessonsAll,
    getLessonById
}