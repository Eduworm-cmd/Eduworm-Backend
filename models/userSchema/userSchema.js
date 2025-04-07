const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    default: null,
  },
});

const teacherSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  department: { type: String },
  specialization: { type: [String] },
  qualifications: { type: [String] },
  experience: { type: Number },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "draft",
  },
  dob: { type: Date },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
});

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "superadmin", "teacher", "schooladmin"],
  },
  course_data: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "course_data.type",
      },
      type: {
        type: String,
        required: true,
        enum: ["Course_Curriculum", "Video", "Game"],
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  switch (this.role) {
    case "teacher":
      const teacher = mongoose.model("teacher", teacherSchema);
      this.role_Data = new teacher(this.role_Data);
      break;
    case "schooladmin":
      const school = mongoose.model("school", schoolSchema);
      this.role_Data = new school(this.role_Data);
      break;
    default:
      next();
    // throw new Error("Invalid role", this.role);
  }
});

const user = mongoose.model("user", userSchema);
module.exports = user;
