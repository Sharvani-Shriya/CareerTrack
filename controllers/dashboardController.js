// controllers/dashboardController.js
// The dashboard controller fetches summary statistics and recent data
// to populate the main dashboard page.

const Application = require('../models/Application');

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

// showDashboard – handles GET /
const showDashboard = async (req, res) => {
  try {
    // --- Count by status ---
    const totalApplications = await Application.countDocuments();
    const applied          = await Application.countDocuments({ status: 'Applied' });
    const oaScheduled      = await Application.countDocuments({ status: 'OA Scheduled' });
    const oaCleared        = await Application.countDocuments({ status: 'OA Cleared' });
    const technicalRound   = await Application.countDocuments({ status: 'Technical Interview' });
    const hrRound          = await Application.countDocuments({ status: 'HR Interview' });
    const offers           = await Application.countDocuments({ status: 'Offer' });
    const rejected         = await Application.countDocuments({ status: 'Rejected' });

    // --- Recent Applications ---
    const recentApplicationsDocs = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentApplications = recentApplicationsDocs.map(app => {
      const obj = app.toObject();
      obj.daysRemaining = calculateDaysRemaining(obj.deadline);
      return obj;
    });

    // --- Upcoming Deadlines (next 7 days) ---
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    const upcomingDeadlinesDocs = await Application.find({
      deadline: { $gte: today, $lte: sevenDaysLater },
    }).sort({ deadline: 1 });
    
    const upcomingDeadlines = upcomingDeadlinesDocs.map(app => {
      const obj = app.toObject();
      obj.daysRemaining = calculateDaysRemaining(obj.deadline);
      return obj;
    });

    // --- Render the dashboard view ---
    res.render('dashboard', {
      title: 'Dashboard – CareerTrack',
      totalApplications,
      applied,
      oaScheduled,
      oaCleared,
      technicalRound,
      hrRound,
      offers,
      rejected,
      recentApplications,
      upcomingDeadlines,
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).send('Server Error');
  }
};

module.exports = { showDashboard };
