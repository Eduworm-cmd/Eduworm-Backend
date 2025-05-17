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
            objective,
            materials,
            activity,
            closure,
            interactiveActivity,
        } = req.body;

        // Validate references
        const Class = await classModel.findById(ClassId);
        if (!Class) return res.status(404).json({ error: "Class not found" });

        const unit = await UnitModel.findById(UnitId);
        if (!unit) return res.status(404).json({ error: "Unit not found" });

        const day = await DayModel.findById(dayId);
        if (!day) return res.status(404).json({ error: "Day not found" });

        // Upload lessonAvatar to Cloudinary
        let lessonAvatarUrl = "";
        try {
            if (!lessonAvatar || lessonAvatar.length < 50) {
                throw new Error("Invalid or missing lesson avatar image data");
            }

            const isDataUri = lessonAvatar.startsWith("data:image/");
            const isUrl = lessonAvatar.startsWith("http");

            const uploadSource = isDataUri
                ? lessonAvatar
                : isUrl
                    ? lessonAvatar
                    : `data:image/png;base64,${lessonAvatar}`;

            const uploadResponse = await cloudinary.uploader.upload(uploadSource, {
                folder: "Lesson Avatars",
            });

            lessonAvatarUrl = uploadResponse.secure_url;
        } catch (uploadError) {
            console.error("Cloudinary lessonAvatar upload error:", uploadError);
            return res.status(500).json({
                message: "lessonAvatar upload failed",
                details:
                    uploadError?.message || uploadError?.error?.message || "Unknown error",
            });
        }

        // Create lesson
        const lesson = new LessonModel({
            dayId,
            ClassId,
            UnitId,
            lessonAvatar: lessonAvatarUrl,
            title,
            subjectType,
            duration,
            objective,
            materials,
            activity,
            closure,
            interactiveActivity,
        });

        await lesson.save();

        res.status(201).json({
            success: true,
            message: "Lesson created successfully",
            data: lesson,
        });
    } catch (error) {
        console.error("Lesson creation error:", error);
        res.status(500).json({ error: error.message });
    }
  };
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