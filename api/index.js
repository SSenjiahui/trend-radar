import express from 'express';
import cors from 'cors';
import { aggregator } from '../server/services/aggregator.js';
import { PLATFORMS } from '../server/adapters/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// API endpoints for Vercel Serverless
app.get('/api/trends', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const data = await aggregator.getAllTrends(force);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/trends/:platform', async (req, res) => {
  try {
    const platformId = req.params.platform;
    const force = req.query.force === 'true';
    const data = await aggregator.getPlatformTrends(platformId, force);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

app.get('/api/platforms', (req, res) => {
  const list = Object.values(PLATFORMS).map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    category: p.category,
    region: p.region
  }));
  res.json({ success: true, platforms: list });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default app;
