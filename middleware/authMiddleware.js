const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const roleMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    console.log('\n=== NEW REQUEST ===');
    console.log('Endpoint:', req.method, req.originalUrl);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    // 1. Extract Token with Debugging
    const authHeader = req.header('Authorization');
    console.log('\n[1] Raw Authorization Header:', authHeader ? `"${authHeader}"` : 'UNDEFINED');

    if (!authHeader) {
      console.error('❌ No Authorization header found');
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    // 2. Verify Bearer Format
    const [bearer, token] = authHeader.split(' ');
    console.log('\n[2] Split Result:', { bearer, token });

    if (!bearer || bearer.toLowerCase() !== 'bearer') {
      console.error('❌ Missing Bearer prefix');
      return res.status(401).json({ message: 'Use "Bearer <token>" format' });
    }

    if (!token) {
      console.error('❌ Token not found after Bearer');
      return res.status(401).json({ message: 'Token missing' });
    }


    console.log('\n[3] Token Length:', token.length, 'characters');
    if (token.length < 50) { 
      console.error('❌ Suspiciously short token');
      return res.status(401).json({ message: 'Invalid token length' });
    }

    // 4. JWT Verification
    try {
      console.log('\n[4] Verifying with Secret:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('\n[5] Decoded Token:', decoded);

      // 5. Role Validation
      if (!allowedRoles.includes(decoded.role)) {
        console.error('❌ Role not allowed:', decoded.role);
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // 6. Attach User Data
      req.user = {
        _id: decoded._id,
        role: decoded.role,
        ...(decoded.school && { school: decoded.school }) // Optional school field
      };

      console.log('\n[6] Attached User:', req.user);
      console.log('✅ Middleware passed');
      next();

    } catch (err) {
      console.error('\n❌ JWT Verification Error:', {
        name: err.name,
        message: err.message,
        expiredAt: err.expiredAt,
        stack: err.stack
      });

      let errorMsg = 'Invalid token';
      if (err.name === 'TokenExpiredError') errorMsg = 'Token expired';
      if (err.name === 'JsonWebTokenError') errorMsg = 'Token malformed';

      res.status(401).json({
        message: errorMsg,
        error: err.message,
        hint: 'Check token validity and server secret'
      });
    }
  };
};

module.exports = roleMiddleware;