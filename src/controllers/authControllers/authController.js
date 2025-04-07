const userSchema = require("../../../models/userSchema/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


class authController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }
            const user = await userSchema.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

const authController = new authController();
module.exports = authController