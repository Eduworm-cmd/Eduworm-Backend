const staffSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['staff', 'teacher'], required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // Optional for staff
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }, // Optional for staff
});

const Staff = mongoose.model('SchoolStaff', staffSchema);
