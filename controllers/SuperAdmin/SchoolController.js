const mongoose = require("mongoose");
const schoolModel = require("../../models/SuperAdmin/schoolModel");

class SchoolController {
    createSchool = async (req, res) => {
        try {
          const { firstName, lastName, schoolName, contact } = req.body;
      
          if (!firstName || !lastName || !schoolName || !contact?.email || !contact?.phone) {
            return res.status(400).json({ message: "All fields are required!" });
          }
      
          const existingUser = await schoolModel.findOne({
            $or: [
              { 'contact.email': contact.email },
              { 'contact.phone': contact.phone },
            ],
          });
      
          if (existingUser) {
            return res.status(409).json({ message: "Email or phone already exists!" });
          }
      
          const newSchool = new schoolModel({
            firstName,
            lastName,
            schoolName,
            contact,
          });
      
          await newSchool.save();
      
          res.status(201).json({
            message: "School created successfully!",
            data: newSchool,
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: error.message });
        }
    };

    getAllSchool = async(req, res) =>{
        try {
            let {page = 1, limit=10} = req.query;
            const skip = (page - 1)* limit;

            const allSchool = await schoolModel
            .find()
            .sort({startDate:-1})
            .skip(skip)
            .limit(limit);

            if(!allSchool || allSchool.length === 0){
                return res.status(404).json({message: "No School Fonud !"});
            }

            const totalSchools = await schoolModel.countDocuments();

            return res.status(200).json({
                message:"School Data featch Successfully ",
                page,
                limit,
                totalSchools,
                totalPage: Math.ceil(totalSchools /limit),
                data: allSchool
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({message:error.message});
        }
    }

    getSchoolsForDropdown = async(req,res) =>{
        try{
            const allSchool = await schoolModel
            .find()
            .select('_id schoolName');

            if(!allSchool || allSchool.length === 0 ){
                return res.status(404).json({message:"School Not Found !"})
            }

            return res.status(201).json({message:"School Fetched successfully", data:allSchool});
        }catch(error){
            console.log(error.message);
            res.status(500).json({message:error.message});
        }
    }

    getSchoolById = async(req,res) =>{
      try{
        const {schoolId} = req.params;
        
        if(!schoolId){
          return res.status(400).json({message:"School Id ir required !"})
        }
        if(!mongoose.Types.ObjectId.isValid(schoolId)){
          return res.status.json({message: "Invalid School Id !"});
        }

        const school = await schoolModel.findById(schoolId);

        res.status(201).json({message: "School Data Featch Successfully !", school});

      }catch(error){
        console.log(error.message);
        res.status(500).json({message:error.message});
      }
    }
}



module.exports = new SchoolController();