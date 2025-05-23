const WeekSchema = new mongoose.Schema({
  unit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  week_number: { type: Number, required: true },
  title: { type: String },
  description: { type: String },
  total_days: { type: Number, default: 5 },
},{timestamps:true});