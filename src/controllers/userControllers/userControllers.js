const userSchema = require("../../../models/userSchema/userSchema");

class userControllers {

    async register(req, res) {
        try {
            const { firstName, lastName, email, password , role } = req.body;

            if (!firstName || !lastName || !email || !password || !role) {
                return sendResponse(res, 400, false, null, "firstName, lastName, email, password, role");
            }

            const encodedPassword = await bcrypt.hash(password, process.env.SALT_ROUND);
            console.log(encodedPassword);
            return false 
            const user = new userSchema({
                firstName,
                lastName,
                email,
                password,
                role,
            });
            const savedUser = await user.save();
            sendResponse(res, 200, true, savedUser);
        } catch (error) {
            sendResponse(res, 500, false, null, error.message);
        }
    }

    async getUserData(req, res) {
        try {
            const { id } = req.user;
            const savedUser = await userSchema.findOne({ _id: id }).populate("role_Data.item");
            if (!savedUser) {
                return sendResponse(res, 404, false, null, "User not found");
            }

            sendResponse(res, 200, true, savedUser);

        }catch (error) {
            sendResponse(res, 500, false, null, error.message);
        }
    }

}

module.exports = new userControllers();