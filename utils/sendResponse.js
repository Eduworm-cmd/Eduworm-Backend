const sendResponse = (res, status, success, data = null, error = null, message = null) => {
    const response = { success };

    if (message) {
        response.message = message;
    }

    if (data) {
        Object.assign(response, data); 
    }

    if (error) {
        response.error = error;
    }

    return res.status(status).json(response);
};

module.exports = sendResponse;
