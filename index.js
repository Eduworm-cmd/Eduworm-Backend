const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");



dotenv.config();
app.use(cors());






app.get("/:name", (req, res) => {
    const name = req.params.name;
    res.send(`Hello ${name}`);
});

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "localhost";
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});