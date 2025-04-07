const userSchema = require("../../../models/userSchema/userSchema");
const RefreshToken = require("../../../models/authModels/refreshTokenSchema/refreshTokenSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendResponse = require("../../../utils/sendResponse");


class authController {

    constructor() {
        this.userLogin = this.userLogin.bind(this);
        this.userLogout = this.userLogout.bind(this);
    }

    async generateRefreshToken (userId, ipAddress, deviceInfo){
        const token = jwt.sign({ userId, ipAddress, deviceInfo }, process.env.JWT_REFRESH_TOKEN_KEY, { expiresIn: '7d' });   
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const refreshToken = new RefreshToken({
            token,
            userId,
            ipAddress,
            deviceInfo,
            expiresAt
            });
        await refreshToken.save();
        return token;
    }

    async userLogin(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return sendResponse(res, 400, false, null, "Email and password are required");
            }

            const savedUser = userSchema.findOne({ email });
            if (!savedUser) {
                return sendResponse(res, 404, false, null, "please Check the email we didn't find any user");
            }

            const isMatch = await bcrypt.compare(password, savedUser.password);

            if (!isMatch) {
                return sendResponse(res, 401, false, null, "Incorrect password");
            }
            const ipAddress = req.ip;
            const deviceInfo = req.headers['user-agent']; 
            const accessToken = jwt.sign({ id: savedUser._id , role: savedUser.role }, process.env.JWT_ACCESS_TOKEN_KEY, { expiresIn: '1d' });
            const refreshToken = await this.generateRefreshToken(savedUser._id, ipAddress, deviceInfo);
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' , maxAge: 7 * 24 * 60 * 60 * 1000, });
            return sendResponse(res, 200, true, { accessToken }, null);
        } catch (error) {
            sendResponse(res, 500, false, null, error?.message || "Internal server error");
        }
    }


    async userLogout(req, res) {
        try {
            const cookies = req.cookies; 
            // Check if refresh token is present in cookies
            if (!cookies?.refreshToken) {
                return sendResponse(res, 401, false, null, "No refresh token found in cookies");
            }
    
            const refreshToken = cookies.refreshToken;
    
            // Find the refresh token in the database
            const storedToken = await RefreshToken.findOne({ token: refreshToken });
    
            // If the token is not found, clear the cookie and return a message
            if (!storedToken) {
                res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'Strict' });
                return sendResponse(res, 401, false, null, "Refresh token not found in database, but cookie cleared");
            }
            // Delete the token from the databas
            await RefreshToken.deleteOne({ _id: storedToken._id });
            // Clear the cookie and send a success message
            res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'Strict' });
            return sendResponse(res, 200, true, null, "Successfully logged out and refresh token cleared");
        } catch (error) {
            sendResponse(res, 500, false, null, error?.message || "Internal server error");
        }
    }
    
    async refreshAccessToken (req, res)  {

        try {
            // Step 1: Extract refresh token from cookies
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return sendResponse(res, 400, false, null, "Refresh token is missing");
            }    
            // Step 2: Validate refresh token in database
            const storedToken = await RefreshToken.findOne({ token: refreshToken});


            if (!storedToken) {
                return sendResponse(res, 403, false, null, "Invalid or unrecognized refresh token");
            }
    
            // Step 3: Check token expiration
            if (new Date() > storedToken.expiresAt) {
                await storedToken.remove(); 
                return sendResponse(res, 401, false, null, "Refresh token expired");
            }
    
            // Step 4: Verify IP address match
            if (req.ip !== storedToken.ipAddress) {
                console.warn(`IP address mismatch: Expected ${storedToken.ipAddress}, but got ${req.ip}`);
                return sendResponse(res, 403, false, null, "IP address mismatch");
            }
    
            // Step 5: Verify the refresh token using JWT
            const decodedToken = await validateRefreshToken(refreshToken, process.env.JWT_REFRESH_TOKEN_KEY);    
            // Step 6: Generate new access token
            const accessToken = jwt.sign(
                { id: decodedToken.userId }, // Include necessary payload fields
                process.env.JWT_ACCESS_TOKEN_KEY,
                { expiresIn: '1d' }
            );
    
            // Step 7: Send the new access token to the client
    

            return sendResponse(res, 200, true, { accessToken },  null ,'Access token refreshed successfully');
        } catch (error) {
            sendResponse(res, 500, false, null, error?.message || "Internal server error"); 
        }
    }
}

module.exports = new authController();