import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { aggregator } from './services/aggregator.js';
import { PLATFORMS } from './adapters/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Get all platforms summary & full leaderboard data
app.get('/api/trends', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const data = await aggregator.getAllTrends(force);
    res.json(data);
  } catch (err) {
    console.error('Error in /api/trends:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get specific platform data
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

// 3. Get platform list info
app.get('/api/platforms', (req, res) => {
  const list = Object.values(PLATFORMS).map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    category: p.category
  }));
  res.json({ success: true, platforms: list });
});

// 4. SSE Stream for Real-time Auto-Push
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  aggregator.addSubscriber(res);
  res.write(`data: ${JSON.stringify({ type: 'connected', time: Date.now() })}\n\n`);
});

// 5. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 6. Serve static client build if exists
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Preload data on startup
aggregator.getAllTrends().then(() => {
  console.log('Initial trends preloaded successfully.');
}).catch(e => console.error('Initial preload error:', e));

// Background auto-refresh interval (every 90s)
setInterval(() => {
  aggregator.getAllTrends(true).catch(e => console.error('Background refresh error:', e));
}, 90 * 1000);

app.listen(PORT, () => {
  console.log(`[TrendRadar] Web & API Server running at http://localhost:${PORT}`);
});
