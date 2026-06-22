const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.use('/calendar-events', require('./routes/calendarRoutes'));
router.use('/prompts', require('./routes/promptRoutes'));
router.use('/upload', require('./routes/uploadRoutes'));
router.use('/tasks', require('./routes/taskRoutes'));
router.use('/chat', require('./routes/chatRoutes'));
router.use('/drawings', require('./routes/drawingRoutes'));
router.use('/streaks', require('./routes/streakRoutes'));

router.get('/', (req, res) => {
  res.json({ message: 'UpPlanning Backend is running!' });
});

app.use('/api', router);
app.use('/.netlify/functions/api', router);
app.use('/', router);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`UpPlanning Backend is running on port ${PORT}`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;
