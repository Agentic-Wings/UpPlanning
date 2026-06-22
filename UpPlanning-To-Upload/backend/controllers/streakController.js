const { db } = require('../config/firebase');

const COLLECTION_NAME = 'userStats';
const DOC_ID = 'master'; // Since UpPlanning is single-user for now

const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// GET current streak
exports.getStreak = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi.' });
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(DOC_ID);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      // Return default if not exists
      return res.json({ currentStreak: 0, lastActiveDate: null, history: [] });
    }
    
    const data = doc.data();
    const today = getTodayDateString();
    
    // Check if streak is broken (last active was before yesterday)
    let streakCount = data.currentStreak || 0;
    const lastActive = data.lastActiveDate;
    
    if (lastActive && lastActive !== today) {
      const lastDate = new Date(lastActive);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 1) {
        // Streak broken
        streakCount = 0;
        await docRef.update({ currentStreak: 0 });
      }
    }
    
    res.json({ 
      currentStreak: streakCount, 
      lastActiveDate: data.lastActiveDate,
      isProductiveToday: data.lastActiveDate === today
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST record activity (triggers streak increment)
exports.recordActivity = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi.' });
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(DOC_ID);
    const doc = await docRef.get();
    
    const today = getTodayDateString();
    
    if (!doc.exists) {
      // First time activity
      const newData = {
        currentStreak: 1,
        lastActiveDate: today,
        history: [today]
      };
      await docRef.set(newData);
      return res.json({ message: 'Activity recorded', ...newData });
    }
    
    const data = doc.data();
    const lastActive = data.lastActiveDate;
    let newStreak = data.currentStreak || 0;
    let history = data.history || [];
    
    if (lastActive !== today) {
      // It's a new day!
      const lastDate = new Date(lastActive);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        // Continue streak
        newStreak += 1;
      } else {
        // Streak broken, start fresh
        newStreak = 1;
      }
      
      if (!history.includes(today)) {
        history.push(today);
      }
      
      await docRef.update({
        currentStreak: newStreak,
        lastActiveDate: today,
        history: history
      });
      
      return res.json({ message: 'Streak updated!', currentStreak: newStreak, isProductiveToday: true });
    }
    
    // Already recorded today, do nothing but return success
    res.json({ message: 'Activity already recorded for today', currentStreak: newStreak, isProductiveToday: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
