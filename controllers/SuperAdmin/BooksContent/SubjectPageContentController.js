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
            shcedule,
            contentAvtar,
            title,
            duration,
            objectives,
            interactiveActivity
        } = req.body;

        // Basic required fields validation
        if (!objectives || !interactiveActivity) {
            return res.status(400).json({
                success: false,
                message: "objectives and interactiveActivity are required"
            });
        }

        // Validate contentAvtar
        if (!contentAvtar || typeof contentAvtar !== "string") {
            return res.status(400).json({
                success: false,
                message: "contentAvtar is required and must be a valid string"
            });
        }

        // Check existence of Class, Subject, and SubjectPage
        const [existClass, existSubject, existSubjectPage] = await Promise.all([
            classModel.findById(classId),
            subjectModel.findById(SubjectId),
            SubjectPagesModel.findById(SubjectPageId)
        ]);

        if (!existClass) return res.status(404).json({ success: false, message: "Class not found" });
        if (!existSubject) return res.status(404).json({ success: false, message: "Subject not found" });
        if (!existSubjectPage) return res.status(404).json({ success: false, message: "SubjectPage not found" });

        // Upload contentAvtar to Cloudinary if necessary
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
            if (objectives.length > 0 && typeof objectives[0] === 'object' && objectives[0].objectiveTitle) {
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
            let posterUrl = null;

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
                        posterUrl = activity.poster; // Fallback to original if upload fails
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

        // Create and save new subject page content
        const newSubjectPageContent = new subjectPageContentModel({
            classId,
            SubjectId,
            SubjectPageId,
            shcedule: shcedule || "",
            contentAvtar: contentAvtarUrl,
            title,
            duration,
            objectives: formattedObjectives,
            interactiveActivity: formattedInteractiveActivity
        });

        await newSubjectPageContent.save();

        // Add reference to subject page
        existSubjectPage.SubjectPageContent.push(newSubjectPageContent._id);
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

module.exports = {
    createSubjectPageContent
};
