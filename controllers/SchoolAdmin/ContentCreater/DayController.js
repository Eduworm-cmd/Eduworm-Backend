const DayModel = require('../../../models/SchoolAdmin/ContentCreateModels/DayModel');



const getDayByUnitId = async (req, res)=>{
    const {unitId} = req.params;
    try {
        const day = await DayModel.find({unitId}).select("globalDayNumber");
        if(!day) return res.status(404).json({success:false,message:"Day not found"});
        res.status(200).json({success:true,data:day});
    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
}


module.exports = {
    getDayByUnitId
}