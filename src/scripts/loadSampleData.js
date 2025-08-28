require('dotenv').config();
const { loadSampleData } = require('../data/sampleData');

loadSampleData()
  .then(() => {
    console.log('Sample data loading complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to load sample data:', error);
    process.exit(1);
  });