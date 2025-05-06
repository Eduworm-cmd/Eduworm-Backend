const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes_SchoolAdmin");
const superAdminAuthRoutes = require("./routes/authRoutes_SuperAdmin");
const branchRoutes = require("./routes/branchRoutes");
const studentRoutes = require("./routes/studentRoutes");
const StaffRoutes = require("./routes/authRoutes_Teacher");
const gradeRoutes = require("./routes/gradeRoutes");
const classRoutes = require("./routes/classRoutes");
const levelRoutes = require("./routes/levelRoutes");
const contentRoutes = require("./routes/contentRoutes");
const playlistRoutes = require("./routes/playListRoutes");
// Super Admin
const SA_StaffRoutes = require('./routes/SuperAdmin/staffRoutes');
const academicYearRoutes = require('./routes/SuperAdmin/academicYearRoutes');
const schoolRoutes = require('./routes/SuperAdmin/schoolRoutes');

dotenv.config();

const app = express();
app.use(morgan('dev'));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


// Set JSON limits before any routes
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

connectDB();

app.use("/api/schooladmin-auth", authRoutes);
app.use("/api/superadmin-auth", superAdminAuthRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/staff", StaffRoutes);
app.use("/api/grade", gradeRoutes);
app.use("/api/class", classRoutes);
app.use("/api/level", levelRoutes);
app.use("/api/content", contentRoutes);
app.use("/api", playlistRoutes);



// Super Admin API
app.use('/api/school',schoolRoutes)
app.use('/api/SA_Staff',SA_StaffRoutes);
app.use('/api/academicYear',academicYearRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});