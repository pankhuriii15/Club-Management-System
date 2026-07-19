const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    default: null
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Shortlisted', 'Selected', 'Registered'],
    default: 'Pending'
  },
  remarks: {
    type: String,
    default: ''
  },
  applicationDetails: {
    reason: { type: String, default: '' },
    skills: { type: String, default: '' }
  },
  interviewDetails: {
    venue: { type: String, default: '' },
    date: { type: String, default: '' },
    time: { type: String, default: '' },
    location: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});



registrationSchema.index({ userId: 1, clubId: 1 });
registrationSchema.index({ userId: 1, eventId: 1 });
registrationSchema.index({ status: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
