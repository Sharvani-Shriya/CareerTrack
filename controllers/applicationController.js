// controllers/applicationController.js
const Application = require('../models/Application');

const ALL_STATUSES = [
  'Applied', 'OA Scheduled', 'OA Cleared',
  'Technical Interview', 'HR Interview',
  'Offer', 'Rejected',
];

function calculateDaysRemaining(deadline) {
  if (!deadline) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: 'Expired', color: 'red' };
  if (diffDays === 0) return { text: 'Today', color: 'orange' };
  if (diffDays === 1) return { text: '1 day left', color: 'orange' };
  if (diffDays <= 7) return { text: `${diffDays} days left`, color: 'orange' };
  return { text: `${diffDays} days left`, color: 'green' };
}

const listApplications = async (req, res) => {
  try {
    const { search, status, role, sort } = req.query;
    let filter = {};
    if (search && search.trim() !== '') {
      filter.companyName = { $regex: search.trim(), $options: 'i' };
    }
    if (status && status !== '') {
      filter.status = status;
    }
    if (role && role.trim() !== '') {
      filter.role = { $regex: role.trim(), $options: 'i' };
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'deadline') sortOption = { deadline: 1 };
    if (sort === 'company')  sortOption = { companyName: 1 };
    if (sort === 'status')   sortOption = { status: 1 };

    const docs = await Application.find(filter).sort(sortOption);
    const applications = docs.map(app => {
      const obj = app.toObject();
      obj.daysRemaining = calculateDaysRemaining(obj.deadline);
      return obj;
    });

    const allRoles = await Application.distinct('role');

    res.render('applications/index', {
      title: 'Applications – CareerTrack',
      applications,
      allRoles,
      allStatuses: ALL_STATUSES,
      currentSearch: search || '',
      currentStatus: status || '',
      currentRole: role || '',
      currentSort: sort || '',
    });
  } catch (error) {
    console.error('List Applications Error:', error);
    res.status(500).send('Server Error');
  }
};

const newApplicationForm = (req, res) => {
  res.render('applications/new', {
    title: 'New Application – CareerTrack',
    allStatuses: ALL_STATUSES,
  });
};

const createApplication = async (req, res) => {
  try {
    const { companyName, role, location, packageOrStipend, applicationLink, applicationDate, deadline, status, notes } = req.body;

    await Application.create({
      companyName,
      role,
      location,
      packageOrStipend,
      applicationLink,
      applicationDate: applicationDate || Date.now(),
      deadline: deadline || null,
      status: status || 'Applied',
      notes,
      activityHistory: [{
        newStatus: status || 'Applied',
        action: 'Application Created',
        date: Date.now()
      }]
    });
    res.redirect('/applications');
  } catch (error) {
    console.error('Create Application Error:', error);
    res.status(500).send('Server Error');
  }
};

const showApplication = async (req, res) => {
  try {
    const applicationDoc = await Application.findById(req.params.id);
    if (!applicationDoc) return res.status(404).render('404', { title: '404 – Not Found' });
    
    const application = applicationDoc.toObject();
    
    // Sort activityHistory: reverse chronological (newest first)
    if (application.activityHistory) {
      application.activityHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // Sort interviewJournal: newest first
    if (application.interviewJournal) {
      application.interviewJournal.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    application.daysRemaining = calculateDaysRemaining(application.deadline);

    const timeline = ['Applied', 'OA Scheduled', 'OA Cleared', 'Technical Interview', 'HR Interview', 'Offer'];
    res.render('applications/show', {
      title: `${application.companyName} – CareerTrack`,
      application,
      timeline,
    });
  } catch (error) {
    console.error('Show Application Error:', error);
    res.status(500).send('Server Error');
  }
};

const editApplicationForm = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).render('404', { title: '404 – Not Found' });
    res.render('applications/edit', {
      title: `Edit ${application.companyName} – CareerTrack`,
      application,
      allStatuses: ALL_STATUSES,
    });
  } catch (error) {
    console.error('Edit Form Error:', error);
    res.status(500).send('Server Error');
  }
};

const updateApplication = async (req, res) => {
  try {
    const { companyName, role, location, packageOrStipend, applicationLink, applicationDate, deadline, status, notes } = req.body;
    const preparation = {
      resumeUpdated:       req.body['preparation.resumeUpdated']       === 'on',
      aptitudePrepared:    req.body['preparation.aptitudePrepared']    === 'on',
      dsaRevised:          req.body['preparation.dsaRevised']          === 'on',
      oopRevised:          req.body['preparation.oopRevised']          === 'on',
      dbmsRevised:         req.body['preparation.dbmsRevised']         === 'on',
      sqlRevised:          req.body['preparation.sqlRevised']          === 'on',
      hrQuestionsPrepared: req.body['preparation.hrQuestionsPrepared'] === 'on',
    };

    const existingApp = await Application.findById(req.params.id);
    if (!existingApp) return res.status(404).send('Not found');

    const newActivities = [];
    const oldStatus = existingApp.status;
    const newStatus = status;

    if (oldStatus !== newStatus) {
      let action = 'Status Changed';
      if (newStatus === 'Offer') action = 'Offer Received';
      if (newStatus === 'Rejected') action = 'Application Rejected';
      
      newActivities.push({
        previousStatus: oldStatus,
        newStatus: newStatus,
        action: action,
        date: Date.now()
      });
    }

    if (existingApp.notes !== notes) {
      newActivities.push({ action: 'Notes Updated', date: Date.now() });
    }

    const oldDeadlineTime = existingApp.deadline ? new Date(existingApp.deadline).getTime() : null;
    const newDeadlineTime = deadline ? new Date(deadline).getTime() : null;
    if (oldDeadlineTime !== newDeadlineTime) {
      newActivities.push({ action: 'Deadline Changed', date: Date.now() });
    }

    await Application.findByIdAndUpdate(
      req.params.id,
      {
        companyName, role, location, packageOrStipend, applicationLink,
        applicationDate: applicationDate || Date.now(),
        deadline: deadline || null,
        status, notes, preparation,
        $push: { activityHistory: { $each: newActivities } }
      },
      { new: true, runValidators: true }
    );

    res.redirect(`/applications/${req.params.id}`);
  } catch (error) {
    console.error('Update Application Error:', error);
    res.status(500).send('Server Error');
  }
};

const deleteApplication = async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.redirect('/applications');
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).send('Server Error');
  }
};

// Journal endpoints
const addJournal = async (req, res) => {
  try {
    const { round, date, questions, feedback, improve } = req.body;
    await Application.findByIdAndUpdate(req.params.id, {
      $push: { interviewJournal: { round, date, questions, feedback, improve } }
    });
    res.redirect(`/applications/${req.params.id}`);
  } catch (e) { res.status(500).send('Server Error'); }
};

const editJournal = async (req, res) => {
  try {
    const { round, date, questions, feedback, improve } = req.body;
    await Application.findOneAndUpdate(
      { _id: req.params.id, "interviewJournal._id": req.params.journalId },
      {
        $set: {
          "interviewJournal.$.round": round,
          "interviewJournal.$.date": date,
          "interviewJournal.$.questions": questions,
          "interviewJournal.$.feedback": feedback,
          "interviewJournal.$.improve": improve
        }
      }
    );
    res.redirect(`/applications/${req.params.id}`);
  } catch (e) { res.status(500).send('Server Error'); }
};

const deleteJournal = async (req, res) => {
  try {
    await Application.findByIdAndUpdate(req.params.id, {
      $pull: { interviewJournal: { _id: req.params.journalId } }
    });
    res.redirect(`/applications/${req.params.id}`);
  } catch (e) { res.status(500).send('Server Error'); }
};

module.exports = {
  listApplications,
  newApplicationForm,
  createApplication,
  showApplication,
  editApplicationForm,
  updateApplication,
  deleteApplication,
  addJournal,
  editJournal,
  deleteJournal
};
