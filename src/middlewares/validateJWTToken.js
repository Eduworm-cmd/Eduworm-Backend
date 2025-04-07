const jwt = require('jsonwebtoken');

const validateRefreshToken = (token, secretKey) => {
  return new Promise((resolve, reject) => {
      jwt.verify(token, secretKey, (err, decoded) => {
          if (err) {
              if (err.name === 'TokenExpiredError') {
                  return reject({ status: 401, message: 'Refresh token expired' });
              } else if (err.name === 'JsonWebTokenError') {
                  return reject({ status: 403, message: 'Invalid refresh token' });
              }
              return reject({ status: 500, message: 'Failed to verify refresh token' });
          }
          resolve(decoded);
      });
  });
};



const authenticateToken = (req, res, next) => {
  try {
    // 1. Check for the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
    }

    // 2. Extract the token (assuming "Bearer <token>" format)
    const token = authHeader.split(' ')[1]; // Extract the token after "Bearer"
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    // 3. Verify the token
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_KEY, (err, decodedUser) => {
      if (err) {
        // Differentiate errors for clarity
        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({ error: 'Invalid token format' });
        }
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Internal server error while verifying token' });
      }

      // 4. Attach the decoded user object to the request
      req.user = decodedUser;
      console.log(req.user);
      next();
    });
  } catch (error) {
    console.error('Error in authenticateToken middleware:', error);
    return res.status(500).json({ error: 'Unexpected error occurred' });
  }
};

module.exports = { validateRefreshToken , authenticateToken }; 