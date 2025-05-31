const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authSchoolBranchRoutes = require("./routes/SuperAdmin/authSchoolBranchRoutes");
const superAdminAuthRoutes = require("./routes/authRoutes_SuperAdmin");
const gradeRoutes = require("./routes/SuperAdmin/gradeRoutes");
const levelRoutes = require("./routes/levelRoutes");

const playlistRoutes = require("./routes/playListRoutes");
// Super Admin
const SA_StaffRoutes = require('./routes/SuperAdmin/staffRoutes');
const academicYearRoutes = require('./routes/SuperAdmin/academicYearRoutes');
const schoolRoutes = require('./routes/SuperAdmin/schoolRoutes');
const classRoutes = require('./routes/SuperAdmin/classRoutes');
const studentsRoutes = require('./routes/SuperAdmin/studentRoutes');
const staffRoutes = require('./routes/SchoolAdmin/staffRoutes');
const unitRoutes = require('./routes/SchoolAdmin/ContentCreate/unitRoutes');
const DayRoutes = require('./routes/SchoolAdmin/ContentCreate/DayRoutes');
const LessonRoutes = require('./routes/SchoolAdmin/ContentCreate/LessonRoute');
const subjectRoutes = require('./routes/SuperAdmin/BookContent/SubjectRoutes');
const SubjectPageRoutes = require('./routes/SuperAdmin/BookContent/SubjectPageRoute');
const SubjectPageContentRoutes = require('./routes/SuperAdmin/BookContent/subjectPageContentRoute');

dotenv.config();

const app = express();
app.use(morgan('dev'));
// app.use(cors({
//     origin:["http://localhost:5173","eduwrom-frontend.onrender.com","*"]
//     credentials: true
// }));
app.use(cors({
    origin: function (origin, callback) {
        callback(null, origin || '*');
    },
    credentials: true
}));



// Set JSON limits before any routes
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

connectDB();

app.use("/api/auth_SchoolBranch", authSchoolBranchRoutes);
app.use("/api/superadmin-auth", superAdminAuthRoutes);
app.use("/api/grade", gradeRoutes);
app.use("/api/unit", unitRoutes);
app.use("/api/Day", DayRoutes);
app.use("/api/Lesson", LessonRoutes);
app.use("/api/level", levelRoutes);
app.use("/api", playlistRoutes);

app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Server is live and healthy' });
});


// Super Admin API
app.use('/api/school', schoolRoutes)
app.use('/api/SA_Staff', SA_StaffRoutes);
app.use('/api/academicYear', academicYearRoutes);
app.use('/api/subject', subjectRoutes);
app.use("/api/class", classRoutes);
app.use("/api/subjectPage", SubjectPageRoutes);
app.use("/api/subject_PageContent", SubjectPageContentRoutes);
app.use("/api/superStudent", studentsRoutes);


// School Admin API
app.use("/api/staff", staffRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});