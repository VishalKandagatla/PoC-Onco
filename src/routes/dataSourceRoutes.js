const express = require('express');
const router = express.Router();
const DataSource = require('../models/DataSource');
const InteroperabilityService = require('../services/interoperabilityService');

const interopService = new InteroperabilityService();

router.get('/', async (req, res) => {
  try {
    const dataSources = await interopService.getDataSources();
    res.json(dataSources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const dataSource = await DataSource.findById(req.params.id);
    if (!dataSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    res.json(dataSource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const dataSource = new DataSource(req.body);
    await dataSource.save();
    res.status(201).json(dataSource);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const dataSource = await interopService.updateDataSourceStatus(req.params.id, status);
    res.json({
      message: 'Data source status updated',
      dataSource
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/test', async (req, res) => {
  try {
    const testResult = await interopService.testDataSourceConnection(req.params.id);
    res.json(testResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const dataSource = await DataSource.findByIdAndDelete(req.params.id);
    if (!dataSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    res.json({ message: 'Data source deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/health/check', async (req, res) => {
  try {
    const health = await interopService.getSystemHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;