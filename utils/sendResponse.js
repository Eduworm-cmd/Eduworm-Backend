const sendResponse = (res, status, success, data = null, error = null, message = null) => {
    const response = { success };

    // Include message field if provided
    if (message) {
        response.message = message;
    }

    // Include data if provided
    if (data) {
        Object.assign(response, data); // Spread the data directly into the response
    }

    // Include error field if provided
    if (error) {
        response.error = error;
    }

    return res.status(status).json(response);
};

module.exports = sendResponse;
