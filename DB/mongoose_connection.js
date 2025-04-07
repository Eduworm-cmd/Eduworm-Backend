const { default: mongoose } = require("mongoose");

const mongoose_connection = async () => {
    const URL = process.env.MONGODB_URL;
    if (!URL) {
        throw new Error("MONGODB_URL is not defined");
    }
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully");
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}


module.exports = {mongoose_connection}