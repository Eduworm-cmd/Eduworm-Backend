const SPstaffModel = require('../../models/SuperAdmin/staffModel');
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};


const staffLogin = async (req,res) => {
    
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({mesage:"Email or Password is required !"});
        }

        const existUser = await SPstaffModel.findOne({emailId:email});

        if(!existUser){
            return res.status(400).json({mesage:"User not found"});
        }

        const isMatch = await existUser.comparePassword(password); 

        if(!isMatch){
           return res.status(400).json({message:"Invalid Email & Password !"})
        }

        const token = generateToken(existUser._id, existUser.employeeRole);

        
        res.status(201).json({
            message :"Login Sucessfully",
            _id:existUser._id,
            name:existUser.firstName,
            lastName:existUser.lastName,
            email:existUser.emailId,
            role:existUser.employeeRole,
            token
        })
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

module.exports = { staffLogin }