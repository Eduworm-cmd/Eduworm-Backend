const mongoose = require("mongoose");
const cloudinary = require("../../../config/cloudinary");

const subjectModel = require("../../../models/SuperAdmin/BookConetnt/subjectModel");
const classModel = require("../../../models/SuperAdmin/classModel");
const SubjectPagesModel = require("../../../models/SuperAdmin/BookConetnt/SubjectPagesModel");
const subjectPageContent = require("../../../models/SuperAdmin/BookConetnt/subjectPageContent");

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
        const subjectObjectId = new mongoose.Types.ObjectId(subjectId);

        // 1️⃣ Verify subject exists
        const subject = await subjectModel.findById(subjectObjectId);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        // 2️⃣ Verify class exists
        const classExists = await classModel.findById(subject.classId);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: "Associated class not found",
            });
        }

        // 3️⃣ Start transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 4️⃣ Find all SubjectPages linked to this Subject
            const subjectPages = await SubjectPagesModel.find(
                { SubjectId: subjectObjectId },
                null,
                { session }
            );

            // 5️⃣ Delete all SubjectPageContent for each SubjectPage
            for (const page of subjectPages) {
                await subjectPageContent.deleteMany(
                    { SubjectPageId: page._id },
                    { session }
                );
            }

            // 6️⃣ Delete all SubjectPages
            await SubjectPagesModel.deleteMany(
                { SubjectId: subjectObjectId },
                { session }
            );

            // 7️⃣ Delete the Subject
            await subjectModel.findByIdAndDelete(subjectObjectId, { session });

            // 8️⃣ Remove subject reference from Class
            await classModel.findByIdAndUpdate(
                subject.classId,
                { $pull: { subjects: subjectObjectId } },
                { new: true, session }
            );

            // 9️⃣ Commit transaction
            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                success: true,
                message: "Subject and related data deleted successfully",
            });
        } catch (transactionError) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction error:", transactionError);
            return res.status(500).json({
                success: false,
                message: "Failed to delete subject",
                details: transactionError.message,
            });
        }
    } catch (error) {
        console.error("Error deleting subject:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            details: error.message,
        });
    }
};

  


module.exports = { createSubject, getSubjectsByClassId, deleteSubjectById,dropdowmSubjectsByClassId };
