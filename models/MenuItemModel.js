const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String }, // Store icon name as string
  isActive: { type: Boolean, default: true },
  forRole: { type: String, required: true }, // 'superadmin', 'schooladmin', 'teacher'
  parent: { type: String, default: null }, // For nested menu items
  isParent: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  type: { 
    type: String, 
    enum: ['main', 'button', 'footerBtn'], 
    default: 'main' 
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);