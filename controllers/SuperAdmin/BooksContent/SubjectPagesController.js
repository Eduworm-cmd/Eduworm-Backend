const SubjectPagesModel = require("../../../models/SuperAdmin/BookConetnt/SubjectPagesModel");
const subjectModel = require("../../../models/SuperAdmin/BookConetnt/subjectModel");
const cloudinary = require("../../../config/cloudinary");
const classModel = require("../../../models/SuperAdmin/classModel");
const { default: mongoose } = require("mongoose");
const subjectPageContent = require("../../../models/SuperAdmin/BookConetnt/subjectPageContent");


const createSubjectPages = async (req, res) => {
    try {
        const { SubjectId, classId, title, imageUrl } = req.body;

        // Validate inputs
        if (!SubjectId || !title || !imageUrl || !classId) {
            return res.status(400).json({
                success: false,
                message: "SubjectId, title, and imageUrl are required"
            });
        }


        const existClass = await classModel.findById(classId);
        if (!existClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        // Check if subject exists
        const existSubject = await subjectModel.findById(SubjectId);
        if (!existSubject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        let PageImageUrl = "";

        // Upload to Cloudinary if it's not already a short image URL
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
                PageImageUrl = uploadResult.secure_url;
            } catch (error) {
                console.error("Error uploading image:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading image"
                });
            }
        } else {
            PageImageUrl = imageUrl;
        }

        // Create and save new book page
        const newBookPage = new SubjectPagesModel({
            classId,
            SubjectId,
            title,
            imageUrl: PageImageUrl
        });

        await newBookPage.save();

        existSubject.SubjectPage.push(newBookPage._id);
        await existSubject.save();

        return res.status(201).json({
            success: true,
            message: "Book page created successfully",
            data: newBookPage
        });

    } catch (error) {
        console.error("Error creating book page:", error);
        return res.status(500).json({
            success: false,
            message: "Error creating book page"
        });
    }
};

const getSubjectPagesBySubjectId = async (req, res) => {
    const { SubjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(SubjectId)) {
        return res.status(400).json({ success: false, message: "Invalid Subject ID" });
    }

    try {
        const existSubject = await subjectModel.findById(SubjectId);
        if (!existSubject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        const subjectPages = await SubjectPagesModel.find({ SubjectId }).select("title imageUrl subjectPage").populate('SubjectId','title imageUrl');

        const subjectPageCount = await SubjectPagesModel.countDocuments({ SubjectId });
        
        return res.status(200).json({ success: true, data: subjectPages , pages: subjectPageCount});

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getAllPagesBySubjectId = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        if (!subjectId) {
            return res.status(400).json({ success: false, message: "SubjectId is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({ success: false, message: "Invalid Subject ID" });
        }

        const existSubject = await subjectModel.findById(subjectId);
        if (!existSubject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        const subjectPages = await SubjectPagesModel.find()
            .populate('SubjectId','title')
            .where({ SubjectId: subjectId })
            .skip(skip)
            .limit(limit);
            
        const totalPages = await SubjectPagesModel.countDocuments({ SubjectId: subjectId });
        const totalPagesCount = Math.ceil(totalPages / limit);

        return res.status(200).json({
            success: true,
            data: subjectPages,
            pagination: {
                totalPages: totalPagesCount,
                currentPage: page,
                totalItems: totalPages
            }
        }); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}


const deleteSubjectPageById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Subject Page ID" });
    }

    try {
        // 1. Find the SubjectPage
        const subjectPage = await SubjectPagesModel.findById(id);

        if (!subjectPage) {
            return res.status(404).json({ success: false, message: "Subject Page not found" });
        }

        // 2. Remove reference from Subject model
        await subjectModel.updateMany(
            { SubjectPage: id },
            { $pull: { SubjectPage: id } }
        );

        // 3. Delete all SubjectPageContent with this SubjectPageId
        await subjectPageContent.deleteMany({ SubjectPageId: id });

        // 4. Delete the SubjectPage
        await subjectPage.deleteOne();

        return res.status(200).json({ success: true, message: "Subject Page and related content deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createSubjectPages,
    getSubjectPagesBySubjectId,
    getAllPagesBySubjectId,
    deleteSubjectPageById
};
