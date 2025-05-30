const mongoose = require("mongoose");
const subjectModel = require("../../../models/SuperAdmin/BookConetnt/subjectModel");
const subjectPageContentModel = require("../../../models/SuperAdmin/BookConetnt/subjectPageContent");
const SubjectPagesModel = require("../../../models/SuperAdmin/BookConetnt/SubjectPagesModel");
const classModel = require("../../../models/SuperAdmin/classModel");
const cloudinary = require("cloudinary").v2;

const createSubjectPageContent = async (req, res) => {
    try {
        const {
            classId,
            SubjectId,
            SubjectPageId,
            contentAvtar,
            title,
            duration,
            objectives,
            interactiveActivity
        } = req.body;


        if (!objectives || !interactiveActivity) {
            return res.status(400).json({
                success: false,
                message: "objectives and interactiveActivity are required"
            });
        }

        if (!contentAvtar || typeof contentAvtar !== "string") {
            return res.status(400).json({
                success: false,
                message: "contentAvtar is required and must be a valid string"
            });
        }

        const existingTitle = await subjectPageContentModel.findOne({ title });
        if (existingTitle) {
            return res.status(400).json({
                success: false,
                message: "Title already exists"
            });
        }

        const existingContent = await subjectPageContentModel.findOne({ SubjectPageId });
        if (existingContent) {
            return res.status(400).json({
                success: false,
                message: "Content is already created for this Page!"
            });
        }

        const [existClass, existSubject, existSubjectPage] = await Promise.all([
            classModel.findById(classId),
            subjectModel.findById(SubjectId),
            SubjectPagesModel.findById(SubjectPageId)
        ]);

        if (!existClass) return res.status(404).json({ success: false, message: "Class not found" });
        if (!existSubject) return res.status(404).json({ success: false, message: "Subject not found" });
        if (!existSubjectPage) return res.status(404).json({ success: false, message: "SubjectPage not found" });

        // Upload content avatar to Cloudinary
        let contentAvtarUrl = "";
        if (contentAvtar.startsWith("http")) {
            contentAvtarUrl = contentAvtar;
        } else if (contentAvtar.startsWith("data:image/") || contentAvtar.length > 50) {
            const uploadSource = contentAvtar.startsWith("data:image/")
                ? contentAvtar
                : `data:image/png;base64,${contentAvtar}`;

            try {
                const uploadResult = await cloudinary.uploader.upload(uploadSource, {
                    folder: "subject_images",
                    allowed_formats: ["jpg", "jpeg", "png", "webp"]
                });
                contentAvtarUrl = uploadResult.secure_url;
            } catch (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to upload contentAvtar image",
                    error: uploadError.message
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "contentAvtar must be a valid URL or base64 image data"
            });
        }

        // Format objectives
        let formattedObjectives = [];
        if (Array.isArray(objectives)) {
            if (objectives.length > 0 && typeof objectives[0] === 'object' && 'objectiveTitle' in objectives[0]) {
                formattedObjectives = objectives.map(obj => ({
                    objectiveTitle: obj.objectiveTitle,
                    objectiveValue: obj.objectiveValue
                }));
            } else {
                if (objectives.length % 2 !== 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Objectives array must have even number of items in flat format"
                    });
                }
                for (let i = 0; i < objectives.length; i += 2) {
                    formattedObjectives.push({
                        objectiveTitle: objectives[i],
                        objectiveValue: objectives[i + 1]
                    });
                }
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "objectives must be an array"
            });
        }

        // Format interactiveActivity
        if (!Array.isArray(interactiveActivity)) {
            return res.status(400).json({
                success: false,
                message: "interactiveActivity must be an array"
            });
        }

        const formattedInteractiveActivity = await Promise.all(interactiveActivity.map(async (activity) => {
            let posterUrl = "";

            if (activity.poster && typeof activity.poster === "string") {
                if (activity.poster.startsWith("http")) {
                    posterUrl = activity.poster;
                } else if (activity.poster.startsWith("data:image/") || activity.poster.length > 50) {
                    const uploadSource = activity.poster.startsWith("data:image/")
                        ? activity.poster
                        : `data:image/png;base64,${activity.poster}`;

                    try {
                        const uploadResult = await cloudinary.uploader.upload(uploadSource, {
                            folder: "subject_images",
                            allowed_formats: ["jpg", "jpeg", "png", "webp"]
                        });
                        posterUrl = uploadResult.secure_url;
                    } catch (uploadError) {
                        console.warn("Failed to upload activity poster:", uploadError.message);
                        posterUrl = activity.poster;
                    }
                } else {
                    posterUrl = activity.poster;
                }
            }

            return {
                title: activity.title || "",
                poster: posterUrl,
                link: activity.link || ""
            };
        }));

        const newSubjectPageContent = new subjectPageContentModel({
            classId,
            SubjectId,
            SubjectPageId,
            contentAvtar: contentAvtarUrl,
            title,
            duration,
            objectives: formattedObjectives,
            interactiveActivity: formattedInteractiveActivity
        });

        await newSubjectPageContent.save();

        existSubjectPage.SubjectPageContent = newSubjectPageContent._id;
        await existSubjectPage.save();

        return res.status(200).json({
            success: true,
            message: "SubjectPageContent created successfully",
            data: newSubjectPageContent
        });

    } catch (error) {
        console.error("Error in createSubjectPageContent:", error);
        return res.status(500).json({
            success: false,
            message: "SubjectPageContent creation failed",
            error: error.message
        });
    }
};


        const getContentById = async (req, res) => {
            const { id } = req.params;
            try {

                const subjectPageContent = await subjectPageContentModel.findById(id)
                if (!subjectPageContent) {
                    return res.status(404).json({
                        success: false,
                        message: "SubjectPageContent not found"
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "SubjectPageContent retrieved successfully",
                    data: subjectPageContent
                });
            } catch (error) {
                console.error("Error in getContentById:", error);
                return res.status(500).json({
                    success: false,
                    message: "SubjectPageContent retrieval failed",
                    error: error.message
                });
            }
        }



const updateSubjectPageContent = async (req, res) => {
    try {
        const {
            contentAvtar,
            title,
            duration,
            objectives,
            interactiveActivity
        } = req.body;

        const { contentId } = req.params;

        if (!contentId) {
            return res.status(400).json({ success: false, message: "contentId is required in params" });
        }

        const existingContent = await subjectPageContentModel.findById(contentId);
        if (!existingContent) {
            return res.status(404).json({ success: false, message: "Content not found" });
        }

        // Title uniqueness check
        if (title && title !== existingContent.title) {
            const existingTitle = await subjectPageContentModel.findOne({ title });
            if (existingTitle) {
                return res.status(400).json({ success: false, message: "Title already exists" });
            }
        }

        // Content avatar handling (same as before)
        let contentAvtarUrl = existingContent.contentAvtar;
        if (contentAvtar) {
            if (contentAvtar.startsWith("http")) {
                contentAvtarUrl = contentAvtar;
            } else if (contentAvtar.startsWith("data:image/") || contentAvtar.length > 50) {
                const uploadSource = contentAvtar.startsWith("data:image/")
                    ? contentAvtar
                    : `data:image/png;base64,${contentAvtar}`;
                try {
                    const uploadResult = await cloudinary.uploader.upload(uploadSource, {
                        folder: "subject_images",
                        allowed_formats: ["jpg", "jpeg", "png", "webp"]
                    });
                    contentAvtarUrl = uploadResult.secure_url;
                } catch (uploadError) {
                    return res.status(400).json({
                        success: false,
                        message: "Failed to upload contentAvtar image",
                        error: uploadError.message
                    });
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: "contentAvtar must be a valid URL or base64 image data"
                });
            }
        }

        // Format objectives
        let formattedObjectives = existingContent.objectives;
        if (objectives) {
            if (!Array.isArray(objectives)) {
                return res.status(400).json({ success: false, message: "objectives must be an array" });
            }
            formattedObjectives = [];
            if (objectives.length > 0 && typeof objectives[0] === 'object' && 'objectiveTitle' in objectives[0]) {
                formattedObjectives = objectives.map(obj => ({
                    objectiveTitle: obj.objectiveTitle,
                    objectiveValue: obj.objectiveValue
                }));
            } else {
                if (objectives.length % 2 !== 0) {
                    return res.status(400).json({ success: false, message: "Objectives array must have even number of items in flat format" });
                }
                for (let i = 0; i < objectives.length; i += 2) {
                    formattedObjectives.push({
                        objectiveTitle: objectives[i],
                        objectiveValue: objectives[i + 1]
                    });
                }
            }
        }

        // Format interactiveActivity
        let formattedInteractiveActivity = existingContent.interactiveActivity;
        if (interactiveActivity) {
            if (!Array.isArray(interactiveActivity)) {
                return res.status(400).json({ success: false, message: "interactiveActivity must be an array" });
            }

            formattedInteractiveActivity = await Promise.all(interactiveActivity.map(async (activity) => {
                let posterUrl = "";

                if (activity.poster && typeof activity.poster === "string") {
                    if (activity.poster.startsWith("http")) {
                        posterUrl = activity.poster;
                    } else if (activity.poster.startsWith("data:image/") || activity.poster.length > 50) {
                        const uploadSource = activity.poster.startsWith("data:image/")
                            ? activity.poster
                            : `data:image/png;base64,${activity.poster}`;
                        try {
                            const uploadResult = await cloudinary.uploader.upload(uploadSource, {
                                folder: "subject_images",
                                allowed_formats: ["jpg", "jpeg", "png", "webp"]
                            });
                            posterUrl = uploadResult.secure_url;
                        } catch (uploadError) {
                            console.warn("Failed to upload activity poster:", uploadError.message);
                            posterUrl = activity.poster;
                        }
                    } else {
                        posterUrl = activity.poster;
                    }
                }

                return {
                    title: activity.title || "",
                    poster: posterUrl,
                    link: activity.link || ""
                };
            }));
        }

        // Update the content
        existingContent.title = title || existingContent.title;
        existingContent.duration = duration || existingContent.duration;
        existingContent.contentAvtar = contentAvtarUrl;
        existingContent.objectives = formattedObjectives;
        existingContent.interactiveActivity = formattedInteractiveActivity;

        await existingContent.save();

        return res.status(200).json({
            success: true,
            message: "SubjectPageContent updated successfully",
            data: existingContent
        });

    } catch (error) {
        console.error("Error in updateSubjectPageContent:", error);
        return res.status(500).json({
            success: false,
            message: "SubjectPageContent update failed",
            error: error.message
        });
    }
        };
        

const getContentByPageId = async (req,res) =>{
    const {pageId} = req.params;
    try{
        if(!pageId) {
            return res.status(400).json({ success: false,message: "Page ID is required"});
        }

        if (!mongoose.Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({ success: false, message: "Invalid Page ID" });
        }

        const content = await subjectPageContentModel.find({ SubjectPageId: pageId });
        console.log("Content:", content);

        if (!content) {
            return res.status(404).json({ success: false, message: "Content not found for this Page ID" });
        }

        return res.status(200).json({
            success: true,
            message: "Content retrieved successfully",
            data: content
        });

    } catch (error) {
        console.error("Error in getContentByPageId:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve content",
            error: error.message
        });
    }
}
const getContentByLessonId = async (req, res) => {
    const { lessonId } = req.params;
    try {
        if (!lessonId) {
            return res.status(400).json({ success: false, message: "Page ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({ success: false, message: "Invalid Page ID" });
        }

        // Populating 'subjectId' field, fetching only 'title' from referenced document
        const content = await subjectPageContentModel.findById(lessonId).populate('SubjectId', 'title');

        console.log("Content:", content);

        if (!content) {
            return res.status(404).json({ success: false, message: "Content not found for this Page ID" });
        }

        return res.status(200).json({
            success: true,
            message: "Content retrieved successfully",
            data: content
        });

    } catch (error) {
        console.error("Error in getContentByLessonId:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve content",
            error: error.message
        });
    }
}
  


module.exports = {
    createSubjectPageContent,
    getContentByPageId,
    getContentByLessonId,
    updateSubjectPageContent,
    getContentById
};












