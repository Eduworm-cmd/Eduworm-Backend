const classModel = require('../../models/SuperAdmin/classModel');
const schoolModel = require('../../models/SuperAdmin/schoolModel');

// Get all classes
// exports.getAllClasses = async (req, res) => {
//   try {
//     const classes = await Class.find()

//     return res.status(200).json({
//       success: true,
//       count: classes.length,
//       data: classes
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: 'Server Error'
//     });
//   }
// };

// // Get single class
// exports.getClassById = async (req, res) => {
//   try {
//     const classObj = await Class.findById(req.params.id)

//     if (!classObj) {
//       return res.status(404).json({
//         success: false,
//         error: 'Class not found'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: classObj
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: 'Server Error'
//     });
//   }
// };

// // Create new class
// exports.createClass = async (req, res) => {
//   try {
//     const newClass = await Class.create(req.body);

//     return res.status(201).json({
//       success: true,
//       data: newClass
//     });
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(val => val.message);
//       return res.status(400).json({
//         success: false,
//         error: messages
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       error: 'Server Error'
//     });
//   }
// };

// // Update class
// exports.updateClass = async (req, res) => {
//   try {
//     const classObj = await Class.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!classObj) {
//       return res.status(404).json({
//         success: false,
//         error: 'Class not found'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: classObj
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: 'Server Error'
//     });
//   }
// };

// // Delete class
// exports.deleteClass = async (req, res) => {
//   try {
//     const classObj = await Class.findById(req.params.id);

//     if (!classObj) {
//       return res.status(404).json({
//         success: false,
//         error: 'Class not found'
//       });
//     }

//     await classObj.remove();

//     return res.status(200).json({
//       success: true,
//       data: {}
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: 'Server Error'
//     });
//   }
// };

// // Toggle class active status
// exports.toggleClassStatus = async (req, res) => {
//   try {
//     const classObj = await Class.findById(req.params.id);

//     if (!classObj) {
//       return res.status(404).json({
//         success: false,
//         error: 'Class not found'
//       });
//     }

//     // Toggle the isActive status
//     classObj.isActive = !classObj.isActive;
//     await classObj.save();

//     return res.status(200).json({
//       success: true,
//       data: classObj,
//       message: `Class ${classObj.isActive ? 'activated' : 'deactivated'} successfully`
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: 'Server Error'
//     });
//   }
// };



class ClassController {

  //Create Class
  createClass = async (req, res) => {
    try {
      const { className, type } = req.body;

      if (!className || !type) {
        return res.status(400).json({ message: "ClassName & Type are required!" });
      }

      const validTypes = ['Sepcial', 'General'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid type!" });
      }

      const alreadyExits = await classModel.findOne({className});
      
      if (alreadyExits) {
        return res.status(400).json({ message: `${className} already exists.` });
      } 
      
      const newClass = await classModel.create({
        className,
        type
      });

      return res.status(201).json({ message: "Class created successfully", newClass });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  };

  // Get All Class
  getAllClass = async (req, res) => {
    try {
      const allClasses = await classModel.find()
      .populate('grades', '_id name')
  
      if (!allClasses || allClasses.length === 0) {
        return res.status(404).json({ message: "No class data found!" });
      }
  
      return res.status(200).json({
        message: "Classes fetched successfully!",
        data: allClasses
      });
  
    } catch (error) {
      console.error("Error fetching classes:", error);
      return res.status(500).json({ message: "Server error: " + error.message });
    }
  };

  // Class For Dropdown
  getClassForDropdown = async(req,res) =>{
    try{
      const allClasses = await classModel.find().select('_id className');

      if(!allClasses || allClasses.length === 0 ){
        return res.status(404).json({message:"School Not Found !"})
    }

    return res.status(201).json({data:allClasses});

    }catch(error){
       console.log(error);
       return res.status(500).json({message:error.message});
    }
  }

}


module.exports = new ClassController();