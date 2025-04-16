const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes_SchoolAdmin");
const branchRoutes = require("./routes/branchRoutes");
const studentRoutes = require("./routes/studentRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

connectDB();

app.use("/api/schooladmin-auth", authRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/students", studentRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
