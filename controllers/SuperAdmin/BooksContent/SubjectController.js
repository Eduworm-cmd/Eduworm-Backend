const mongoose = require("mongoose");
const cloudinary = require("../../../config/cloudinary");

const subjectModel = require("../../../models/SuperAdmin/BookConetnt/subjectModel");
const classModel = require("../../../models/SuperAdmin/classModel");

const createSubject = async (req, res) => {
    try {
        const { classId, title, imageUrl } = req.body;


        if (!classId || !title || !imageUrl) {
            return res.status(400).json({ success: false, message: "classId, title, and imageUrl are required" });
        }


        const existClass = await classModel.findById(classId);
        if (!existClass) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }

        let subjectImageUrl = "";


        if (imageUrl.length > 50) {
            const uploadSource = imageUrl.startsWith("data:image/")
                ? imageUrl
                : imageUrl.startsWith("http")
                    ? imageUrl
                    : `data:image/png;base64,${imageUrl}`;

            try {
                const uploadResult = await cloudinary.uploader.upload(uploadSource, {
                    folder: "subject_images",
                    allowed_formats: ["jpg", "jpeg", "png", "webp"]
                });
                subjectImageUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.error("Image upload failed:", uploadError);
                return res.status(400).json({ success: false, message: "Failed to upload image", details: uploadError.message });
            }
        } else {
            subjectImageUrl = imageUrl;
        }


        const newSubject = await subjectModel.create({
            classId,
            title,
            imageUrl: subjectImageUrl
        });

        existClass.subject.push(newSubject._id);
        await existClass.save();

        return res.status(200).json({ success: true, message: "Subject created successfully", data: newSubject });

    } catch (error) {
        console.error("Error creating subject:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", details: error.message });
    }
};


const dropdowmSubjectsByClassId = async (req, res) => {
    const { classId } = req.params;

    try {
        if (!classId) {
            return res.status(400).json({ success: false, message: "classId is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({ success: false, message: "Invalid classId format" });
        }

        const subjects = await subjectModel.find({ classId }).select("_id title");
        // Optional: .populate('classId') or .populate('SubjectPage') if needed

        return res.status(200).json({ success: true, data: subjects });
    } catch (error) {
        console.error("Error", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", details: error.message });
    }
};

const getSubjectsByClassId = async (req, res) => {
    const { classId } = req.params;

    try {
        const existClass = await classModel.findById(classId);
        if (!existClass) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }
        const subjects = await subjectModel.find({ classId })
        .populate('classId', 'className');

        return res.status(200).json({ success: true, data: subjects });
    } catch (error) {
        console.error("Error", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", details: error.message });
    }
}


const deleteSubjectById = async (req, res) => {
    const { subjectId } = req.params;
    try {
        // Convert subjectId to ObjectId for consistent comparison
        const subjectObjectId = new mongoose.Types.ObjectId(subjectId);

        // Find the subject and get classId reference
        const subject = await subjectModel.findById(subjectObjectId);
        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        // Verify the class exists
        const classExists = await classModel.findById(subject.classId);
        if (!classExists) {
            return res.status(404).json({ success: false, message: "Associated class not found" });
        }

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Delete the subject
            await subjectModel.findByIdAndDelete(subjectObjectId, { session });

            // Remove subject reference from class
            const updatedClass = await classModel.findByIdAndUpdate(
                subject.classId,
                { $pull: { subjects: subjectObjectId } },
                { new: true, session }
            );

            // Verify the subject was removed from class
            if (updatedClass.subjects.includes(subjectObjectId)) {
                throw new Error("Subject reference not removed from class");
            }

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                success: true,
                message: "Subject deleted successfully and removed from class"
            });
        } catch (transactionError) {
            await session.abortTransaction();
            session.endSession();
            throw transactionError;
        }
    } catch (error) {
        console.error("Error deleting subject:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            details: error.message
        });
    }
};

module.exports = { createSubject, getSubjectsByClassId, deleteSubjectById,dropdowmSubjectsByClassId };
