// routes/applications.js
const express = require('express');
const router = express.Router();
const {
  listApplications,
  newApplicationForm,
  createApplication,
  showApplication,
  editApplicationForm,
  updateApplication,
  deleteApplication,
  addJournal,
  editJournal,
  deleteJournal,
} = require('../controllers/applicationController');

// GET  /applications       → list all
router.get('/', listApplications);

// GET  /applications/new   → show create form (must be before /:id)
router.get('/new', newApplicationForm);

// POST /applications       → create new application
router.post('/', createApplication);

// GET  /applications/:id   → show single application detail
router.get('/:id', showApplication);

// GET  /applications/:id/edit → show edit form
router.get('/:id/edit', editApplicationForm);

// PUT  /applications/:id   → update application
router.put('/:id', updateApplication);

// DELETE /applications/:id → delete application
router.delete('/:id', deleteApplication);

// ── Interview Journal Routes (POST only, beginner-friendly) ──
router.post('/:id/journal', addJournal);
router.post('/:id/journal/edit/:journalId', editJournal);
router.post('/:id/journal/delete/:journalId', deleteJournal);

module.exports = router;
