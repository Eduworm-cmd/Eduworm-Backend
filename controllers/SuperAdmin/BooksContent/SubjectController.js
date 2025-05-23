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


const getSubjectsByClassId = async(req,res) =>{
    const {classId} = req.params;

    try {
        const existClass = await classModel.findById(classId);
        if (!existClass) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }
        const subjects = await subjectModel.find({classId}).select("title");

        return res.status(200).json({success:true,data:subjects});
    } catch (error) {
        
    }
}

module.exports = { createSubject, getSubjectsByClassId };
