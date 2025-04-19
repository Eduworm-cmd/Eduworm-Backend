const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes_SchoolAdmin");
const superAdminAuthRoutes = require("./routes/authRoutes_SuperAdmin");
const branchRoutes = require("./routes/branchRoutes");
const studentRoutes = require("./routes/studentRoutes");
const StaffRoutes = require("./routes/authRoutes_Teacher");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

connectDB();

app.use("/api/schooladmin-auth", authRoutes);
app.use("/api/superadmin-auth", superAdminAuthRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/staff", StaffRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
