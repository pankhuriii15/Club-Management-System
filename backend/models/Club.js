const mongoose = require('mongoose');

const pastEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  images: [{ type: String }]
});

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  mission: {
    type: String,
    default: ''
  },
  vision: {
    type: String,
    default: ''
  },
  establishedDate: {
    type: Date,
    default: Date.now
  },
  registrationFee: {
    type: Number,
    required: true,
    default: 0
  },
  coordinatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  clubAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  president: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    contact: { type: String, default: '' },
    photo: { type: String, default: '' }
  },
  vicePresident: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    contact: { type: String, default: '' },
    photo: { type: String, default: '' }
  },
  qualificationCriteria: {
    type: String,
    default: ''
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pastEvents: [pastEventSchema],
  gallery: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Club', clubSchema);
