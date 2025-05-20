const SPstaffModel = require('../../models/SuperAdmin/staffModel');
const SAstaffModel = require('../../models/SchoolAdmin/staffModal')
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};


const staffLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email or Password is required!" });
        }

        // Check both schemas for the user
        let user = await SAstaffModel.findOne({ emailId: email });

        if (!user) {
            user = await SPstaffModel.findOne({ emailId: email });
        }

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Email or Password!" });
        }

        // Generate token
        const token = generateToken(user._id, user.employeeRole);

        res.status(200).json({
            message: "Login Successfully",
            _id: user._id,
            name: user.firstName,
            lastName: user.lastName,
            email: user.emailId,
            role: user.employeeRole,
            token,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


module.exports = { staffLogin }