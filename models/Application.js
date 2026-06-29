// models/Application.js
// This is the Mongoose schema/model for an internship or placement application.
// A schema defines the shape of documents (records) in MongoDB.

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    // --- Company & Role Info ---
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true, // removes leading/trailing whitespace
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote',
    },
    packageOrStipend: {
      type: String,
      trim: true,
      default: 'Not Disclosed',
    },
    applicationLink: {
      type: String,
      trim: true,
      default: '',
    },

    // --- Dates ---
    applicationDate: {
      type: Date,
      default: Date.now, // automatically set to today if not provided
    },
    deadline: {
      type: Date,
    },

    // --- Status ---
    // The 'enum' validator ensures only these values are allowed
    status: {
      type: String,
      enum: [
        'Applied',
        'OA Scheduled',
        'OA Cleared',
        'Technical Interview',
        'HR Interview',
        'Offer',
        'Rejected',
      ],
      default: 'Applied',
    },

    // --- Notes ---
    notes: {
      type: String,
      trim: true,
      default: '',
    },

    // --- Activity History ---
    activityHistory: [
      {
        previousStatus: String,
        newStatus: String,
        action: String,
        date: { type: Date, default: Date.now },
      },
    ],

    // --- Interview Journal ---
    interviewJournal: [
      {
        round: String,
        date: Date,
        questions: String,
        feedback: String,
        improve: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // --- Preparation Checklist ---
    // Each field is a Boolean (true = done, false = not done)
    preparation: {
      resumeUpdated: { type: Boolean, default: false },
      aptitudePrepared: { type: Boolean, default: false },
      dsaRevised: { type: Boolean, default: false },
      oopRevised: { type: Boolean, default: false },
      dbmsRevised: { type: Boolean, default: false },
      sqlRevised: { type: Boolean, default: false },
      hrQuestionsPrepared: { type: Boolean, default: false },
    },
  },
  {
    // timestamps: true automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create the model from the schema.
// mongoose.model('Application', schema) creates a model named 'Application'
// MongoDB will store documents in a collection named 'applications' (auto-pluralized)
const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
