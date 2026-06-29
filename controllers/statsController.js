// controllers/statsController.js
// Fetches aggregated data from MongoDB to power the Statistics/Charts page.

const Application = require('../models/Application');

const ALL_STATUSES = [
  'Applied',
  'OA Scheduled',
  'OA Cleared',
  'Technical Interview',
  'HR Interview',
  'Offer',
  'Rejected',
];

// showStats – handles GET /stats
const showStats = async (req, res) => {
  try {
    const total = await Application.countDocuments();

    // --- Applications Per Status ---
    // For each status, count the number of applications
    const statusCounts = await Promise.all(
      ALL_STATUSES.map(async (s) => ({
        status: s,
        count: await Application.countDocuments({ status: s }),
      }))
    );

    // --- Applications Per Month ---
    // MongoDB aggregation pipeline to group by year+month
    const monthlyData = await Application.aggregate([
      {
        // $group groups documents by a key and applies accumulators
        $group: {
          _id: {
            year:  { $year: '$applicationDate' },
            month: { $month: '$applicationDate' },
          },
          count: { $sum: 1 }, // count how many docs per group
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, // sort chronologically
      { $limit: 12 }, // show only last 12 months
    ]);

    // Format monthly data for Chart.js labels and values
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthlyLabels = monthlyData.map(
      (d) => `${monthNames[d._id.month - 1]} ${d._id.year}`
    );
    const monthlyCounts = monthlyData.map((d) => d.count);

    // --- Success Rate ---
    // Define "success" as reaching Offer stage
    const offers   = await Application.countDocuments({ status: 'Offer' });
    const successRate = total > 0 ? ((offers / total) * 100).toFixed(1) : 0;

    // --- Active Pipeline ---
    const activeCount = await Application.countDocuments({
      status: { $nin: ['Offer', 'Rejected'] },
    });

    res.render('stats', {
      title: 'Statistics – CareerTrack',
      total,
      statusCounts,
      monthlyLabels:  JSON.stringify(monthlyLabels),
      monthlyCounts:  JSON.stringify(monthlyCounts),
      statusLabels:   JSON.stringify(ALL_STATUSES),
      statusValues:   JSON.stringify(statusCounts.map((s) => s.count)),
      offers,
      successRate,
      activeCount,
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).send('Server Error');
  }
};

module.exports = { showStats };
