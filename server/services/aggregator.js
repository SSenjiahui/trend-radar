import { PLATFORMS } from '../adapters/index.js';

class TrendAggregator {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 60 * 1000; // 60 seconds TTL
    this.lastFetched = 0;
    this.cachedSummary = null;
    this.subscribers = new Set();
  }

  async getAllTrends(forceRefresh = false) {
    const now = Date.now();
    const isStale = now - this.lastFetched > this.cacheTTL;

    if (!forceRefresh && !isStale && this.cache.size > 0) {
      return this.formatResponse();
    }

    const platformKeys = Object.keys(PLATFORMS);
    const fetchPromises = platformKeys.map(async (key) => {
      try {
        const items = await PLATFORMS[key].fetcher();
        this.cache.set(key, {
          updatedAt: now,
          items: items || []
        });
      } catch (err) {
        console.error(`Error fetching ${key}:`, err.message);
        if (!this.cache.has(key)) {
          this.cache.set(key, { updatedAt: now, items: [] });
        }
      }
    });

    await Promise.all(fetchPromises);
    this.lastFetched = now;

    this.notifySubscribers();
    return this.formatResponse();
  }

  async getPlatformTrends(platformId, forceRefresh = false) {
    const config = PLATFORMS[platformId];
    if (!config) throw new Error(`Platform ${platformId} not supported.`);

    const now = Date.now();
    const cached = this.cache.get(platformId);

    if (!forceRefresh && cached && (now - cached.updatedAt < this.cacheTTL)) {
      return {
        platform: config,
        updatedAt: cached.updatedAt,
        items: cached.items
      };
    }

    const items = await config.fetcher();
    this.cache.set(platformId, {
      updatedAt: now,
      items: items || []
    });

    return {
      platform: config,
      updatedAt: now,
      items: items || []
    };
  }

  computeGlobalRankings() {
    const allItems = [];
    for (const [platformKey, data] of this.cache.entries()) {
      if (data.items) {
        data.items.forEach(item => {
          allItems.push({ ...item, platformKey });
        });
      }
    }

    const clusters = [];
    allItems.forEach(item => {
      const cleanTitle = (item.title || '').replace(/[【】#\(\)（）\s]/g, '');
      if (!cleanTitle) return;

      let matchedCluster = null;
      for (const cluster of clusters) {
        const overlap = this.calculateSimilarity(cluster.sampleTitle, cleanTitle);
        if (overlap > 0.45) {
          matchedCluster = cluster;
          break;
        }
      }

      const scoreWeight = Math.min(item.hotScore || 100000, 10000000) / 100000;

      if (matchedCluster) {
        matchedCluster.platforms.add(item.platformKey);
        matchedCluster.totalScore += scoreWeight * 1.5;
        matchedCluster.items.push(item);
        if (item.title.length < matchedCluster.title.length) {
          matchedCluster.title = item.title;
        }
      } else {
        clusters.push({
          title: item.title,
          sampleTitle: cleanTitle,
          platforms: new Set([item.platformKey]),
          totalScore: scoreWeight,
          items: [item],
          category: item.category || '全网关注',
          region: item.region || 'domestic'
        });
      }
    });

    return clusters
      .map((c, i) => {
        const platformCount = c.platforms.size;
        const crossPlatformBonus = platformCount > 1 ? (platformCount * 1.8) : 1.0;
        const finalScore = Math.round(c.totalScore * crossPlatformBonus * 100);

        return {
          id: `global-${i}`,
          rank: i + 1,
          title: c.title,
          platformCount: platformCount,
          platforms: Array.from(c.platforms),
          hotScore: finalScore,
          hotFormatted: finalScore > 10000 ? `${(finalScore / 10000).toFixed(1)}万指数` : `${finalScore}指数`,
          relatedLinks: c.items.map(it => ({ platform: it.platform, url: it.url, title: it.title, rank: it.rank })),
          category: c.category,
          region: c.region
        };
      })
      .sort((a, b) => {
        if (b.platformCount !== a.platformCount) {
          return b.platformCount - a.platformCount;
        }
        return b.hotScore - a.hotScore;
      })
      .slice(0, 15)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    if (str1.includes(str2) || str2.includes(str1)) return 0.85;

    const set1 = new Set();
    for (let i = 0; i < str1.length - 1; i++) set1.add(str1.slice(i, i + 2));

    const set2 = new Set();
    for (let i = 0; i < str2.length - 1; i++) set2.add(str2.slice(i, i + 2));

    if (set1.size === 0 || set2.size === 0) return 0;

    let intersection = 0;
    for (const token of set1) {
      if (set2.has(token)) intersection++;
    }

    return (2 * intersection) / (set1.size + set2.size);
  }

  formatResponse() {
    const platformsData = {};
    let totalItems = 0;

    for (const [key, config] of Object.entries(PLATFORMS)) {
      const data = this.cache.get(key) || { updatedAt: this.lastFetched, items: [] };
      platformsData[key] = {
        info: {
          id: config.id,
          name: config.name,
          color: config.color,
          category: config.category,
          region: config.region || 'domestic'
        },
        updatedAt: data.updatedAt,
        items: data.items
      };
      totalItems += data.items.length;
    }

    const globalRankings = this.computeGlobalRankings();

    return {
      success: true,
      lastFetched: this.lastFetched,
      totalPlatforms: Object.keys(PLATFORMS).length,
      totalItems,
      globalRankings,
      platforms: platformsData
    };
  }

  addSubscriber(res) {
    this.subscribers.add(res);
    res.on('close', () => this.subscribers.delete(res));
  }

  notifySubscribers() {
    if (this.subscribers.size === 0) return;
    const payload = `data: ${JSON.stringify({ type: 'update', timestamp: Date.now() })}\n\n`;
    for (const res of this.subscribers) {
      try {
        res.write(payload);
      } catch (e) {
        this.subscribers.delete(res);
      }
    }
  }
}

export const aggregator = new TrendAggregator();
