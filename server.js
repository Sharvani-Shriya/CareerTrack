// server.js
// This is the entry point of our application.
// It sets up Express, connects to MongoDB, and starts the HTTP server.

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// --- Connect to MongoDB ---
connectDB();

// --- Initialize Express App ---
const app = express();

// --- Template Engine Setup ---
// EJS (Embedded JavaScript) lets us render HTML with dynamic data
app.set('view engine', 'ejs');
// Tell Express where to find our view (.ejs) files
app.set('views', path.join(__dirname, 'views'));

// --- Middleware ---
// morgan logs every incoming HTTP request (useful for debugging)
app.use(morgan('dev'));

// Parse URL-encoded form data (sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

// Parse JSON bodies (for any JSON API calls)
app.use(express.json());

// method-override allows HTML forms to send PUT and DELETE requests
// HTML forms only support GET and POST natively
// We use ?_method=PUT or ?_method=DELETE in the form action URL
app.use(methodOverride('_method'));

// Serve static files (CSS, JS, images) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---
// Import all route files
const dashboardRoutes = require('./routes/dashboard');
const applicationRoutes = require('./routes/applications');
const statsRoutes = require('./routes/stats');

// Mount routes at specific paths
app.use('/', dashboardRoutes);           // Dashboard at root
app.use('/applications', applicationRoutes); // All application routes
app.use('/stats', statsRoutes);          // Statistics page

// --- 404 Handler ---
// If no route matches, send a 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404 – Page Not Found' });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CareerTrack server running at http://localhost:${PORT}`);
});
