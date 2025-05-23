const SubjectPagesModel = require("../../models/SuperAdmin/SubjectPagesModel");
const subjectModel = require("../../models/SuperAdmin/subjectModel");
const cloudinary = require("../../config/cloudinary");
const classModel = require("../../models/SuperAdmin/classModel");

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

module.exports = {
    createSubjectPages
};
