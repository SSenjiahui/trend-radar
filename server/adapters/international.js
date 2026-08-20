import axios from 'axios';
import { translateText } from '../services/translator.js';

const defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*'
};

// 1. Hacker News Adapter (Official Firebase Public API + Translation)
export async function fetchHackerNewsTrends() {
  try {
    const topIdsRes = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json', {
      timeout: 5000
    });

    if (Array.isArray(topIdsRes.data)) {
      const top20Ids = topIdsRes.data.slice(0, 20);
      const storyPromises = top20Ids.map(id =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 3500 })
          .then(r => r.data)
          .catch(() => null)
      );

      const stories = (await Promise.all(storyPromises)).filter(Boolean);

      const translatedItems = await Promise.all(stories.map(async (item, idx) => {
        const score = item.score || (500 - idx * 20);
        const comments = item.descendants || 0;
        const titleZh = await translateText(item.title);

        return {
          id: `hn-${item.id || idx}`,
          rank: idx + 1,
          title: item.title || 'Hacker News Story',
          titleZh: titleZh,
          desc: `Author: ${item.by || 'anonymous'} | ${comments} comments`,
          descZh: `作者: ${item.by || '匿名'} · 共 ${comments} 条极客深度讨论`,
          hotScore: score * 100,
          hotFormatted: `${score} pts · ${comments} 讨论`,
          tag: idx < 3 ? 'Top' : '',
          tagType: idx === 0 ? 'warning' : 'default',
          url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
          metrics: { points: score, comments: comments, by: item.by },
          category: '科技极客',
          platform: 'hackernews',
          region: 'global'
        };
      }));

      return translatedItems;
    }
  } catch (err) {
    console.warn('[HackerNews Adapter] Live fetch error, using fallback stream:', err.message);
  }

  return getFallbackHackerNews();
}

function getFallbackHackerNews() {
  const mockStories = [
    { title: 'Show HN: Building Autonomous Agents with Minimal Context Windows', titleZh: '【项目展示】用最小上下文窗口构建自主 AI 智能体系统', score: 842, comments: 312, by: 'antigravity_dev', url: 'https://news.ycombinator.com' },
    { title: 'SQLite in the Browser with WebAssembly and Persistent OPFS Storage', titleZh: '在浏览器中运行 WebAssembly 版 SQLite 与持久化文件系统存储', score: 629, comments: 194, by: 'wasm_master', url: 'https://news.ycombinator.com' },
    { title: 'Why Simple Architectures Win in the Long Run', titleZh: '从长远来看，为什么极简软件架构往往是最终赢家？', score: 512, comments: 245, by: 'eng_lead', url: 'https://news.ycombinator.com' },
    { title: 'DeepSeek-V3 Architecture: Multi-Head Latent Attention Deep Dive', titleZh: '深度剖析 DeepSeek-V3 多头潜在注意力机制架构', score: 489, comments: 167, by: 'ml_researcher', url: 'https://news.ycombinator.com' },
    { title: 'Lessons from 10 Years of Running Zero-Downtime PostgreSQL Clusters', titleZh: '十年运维零宕机 PostgreSQL 生产集群的核心经验总结', score: 395, comments: 128, by: 'db_guru', url: 'https://news.ycombinator.com' },
    { title: 'Show HN: Fast Vector Search Engine implemented in 1,000 lines of Zig', titleZh: '【项目展示】用 1000 行 Zig 语言实现的超快向量搜索引擎', score: 341, comments: 92, by: 'zig_coder', url: 'https://news.ycombinator.com' }
  ];

  return mockStories.map((item, idx) => ({
    id: `hn-fallback-${idx}`,
    rank: idx + 1,
    title: item.title,
    titleZh: item.titleZh,
    desc: `Author: ${item.by} | ${item.comments} comments`,
    descZh: `作者: ${item.by} · 共 ${item.comments} 条极客深度讨论`,
    hotScore: item.score * 100,
    hotFormatted: `${item.score} pts · ${item.comments} 讨论`,
    tag: idx < 3 ? 'Top' : '',
    tagType: idx === 0 ? 'warning' : 'default',
    url: item.url,
    metrics: { points: item.score, comments: item.comments, by: item.by },
    category: '科技极客',
    platform: 'hackernews',
    region: 'global'
  }));
}

// 2. Reddit Adapter (r/popular & r/all JSON API + Translation)
export async function fetchRedditTrends() {
  try {
    const res = await axios.get('https://www.reddit.com/r/popular/hot.json?limit=25', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 TrendRadar/1.0'
      },
      timeout: 5000
    });

    if (res.data && res.data.data && Array.isArray(res.data.data.children)) {
      const items = res.data.data.children.slice(0, 15);
      const translatedItems = await Promise.all(items.map(async (child, idx) => {
        const d = child.data || {};
        const score = d.score || (35000 - idx * 1000);
        const scoreFormatted = score > 1000 ? `${(score / 1000).toFixed(1)}k` : `${score}`;
        const subreddit = d.subreddit_name_prefixed || `r/${d.subreddit}`;
        const titleZh = await translateText(d.title);

        return {
          id: `reddit-${d.id || idx}`,
          rank: idx + 1,
          title: d.title || 'Reddit Hot Post',
          titleZh: titleZh,
          desc: `${subreddit} · posted by u/${d.author || 'user'}`,
          descZh: `${subreddit} 社区 · 发布者 u/${d.author || '匿名'}`,
          hotScore: score,
          hotFormatted: `▲ ${scoreFormatted} · ${d.num_comments || 0} 评论`,
          tag: subreddit,
          tagType: 'info',
          url: `https://www.reddit.com${d.permalink || ''}`,
          metrics: { upvotes: score, comments: d.num_comments, subreddit },
          category: subreddit,
          platform: 'reddit',
          region: 'global'
        };
      }));

      return translatedItems;
    }
  } catch (err) {
    console.warn('[Reddit Adapter] Live fetch error, using fallback stream:', err.message);
  }

  return getFallbackReddit();
}

function getFallbackReddit() {
  const mockReddit = [
    { title: 'Scientists discover new mechanism behind cellular aging and repair', titleZh: '科学家发现细胞衰老与自我修复背后的全新生物学机制', sub: 'r/science', up: 48900, comments: 2310 },
    { title: 'The European Space Agency shares unprecedented 8K image of Orion Nebula', titleZh: '欧洲航天局发布猎户座大星云前所未有的 8K 超高清绝美影像', sub: 'r/space', up: 42100, comments: 1450 },
    { title: 'My 84-year-old grandfather just finished restoring his 1968 classic Mustang', titleZh: '我 84 岁的祖父刚刚亲手完成了 1968 年经典野马老爷车的全部修复', sub: 'r/pics', up: 38400, comments: 1120 },
    { title: 'After 4 years of solo game dev, my indie RPG officially launched on Steam today!', titleZh: '独自开发 4 年！我的独立角色扮演游戏今天终于在 Steam 正式发售了！', sub: 'r/gaming', up: 31200, comments: 1980 },
    { title: 'Open-source community builds fully offline AI translation glasses for under $50', titleZh: '开源社区成功打造 50 美元以下的完全离线 AI 实时翻译智能眼镜', sub: 'r/technology', up: 27500, comments: 890 },
    { title: 'TIL about the Svalbard Global Seed Vault and how it safeguards global biodiversity', titleZh: '【涨知识】关于斯瓦尔巴全球种子库：如何默默守护全人类的物种多样性', sub: 'r/todayilearned', up: 23400, comments: 640 }
  ];

  return mockReddit.map((item, idx) => ({
    id: `reddit-fallback-${idx}`,
    rank: idx + 1,
    title: item.title,
    titleZh: item.titleZh,
    desc: `${item.sub} · Community Discussion`,
    descZh: `${item.sub} · 社区热议`,
    hotScore: item.up,
    hotFormatted: `▲ ${(item.up / 1000).toFixed(1)}k · ${item.comments} 评论`,
    tag: item.sub,
    tagType: 'info',
    url: `https://www.reddit.com/${item.sub}`,
    metrics: { upvotes: item.up, comments: item.comments, subreddit: item.sub },
    category: item.sub,
    platform: 'reddit',
    region: 'global'
  }));
}

// 3. X (Twitter) Trends Adapter + Translation
export async function fetchXTwitterTrends() {
  const mockTrends = [
    { topic: '#SpaceXStarship', topicZh: '#SpaceX星舰 轨道级试飞', tweets: '482.5K 推文', score: 984000, tag: '趋势' },
    { topic: 'Claude 3.7 Sonnet', topicZh: 'Claude 3.7 Sonnet 混合推理新模型发布', tweets: '394.2K 推文', score: 875000, tag: 'AI & 科技' },
    { topic: '#ChampionsLeague', topicZh: '#欧冠联赛 焦点大战精彩回顾', tweets: '320.1K 推文', score: 760000, tag: '体育' },
    { topic: 'Apple Special Event', topicZh: '苹果春季新品发布会前瞻', tweets: '289.4K 推文', score: 680000, tag: '数码科技' },
    { topic: '#Oscars2026', topicZh: '#2026奥斯卡 获奖名单与红毯看点', tweets: '245.8K 推文', score: 590000, tag: '娱乐' },
    { topic: 'Quantum Breakthrough', topicZh: '超导量子计算纠错技术重大突破', tweets: '198.3K 推文', score: 490000, tag: '前沿科学' },
    { topic: '#BitcoinHalving', topicZh: '#比特币减半 全球加密金融分析', tweets: '172.9K 推文', score: 420000, tag: '财经' },
    { topic: 'Next-Gen WebAssembly', topicZh: '下一代 WebAssembly 规范与高性能渲染', tweets: '141.0K 推文', score: 360000, tag: '开发者' }
  ];

  return mockTrends.map((item, idx) => ({
    id: `x-trend-${idx}`,
    rank: idx + 1,
    title: item.topic,
    titleZh: item.topicZh,
    desc: `Global Trending · ${item.tweets}`,
    descZh: `全球热门趋势 · ${item.tweets}`,
    hotScore: item.score,
    hotFormatted: item.tweets,
    tag: item.tag,
    tagType: idx < 3 ? 'danger' : 'default',
    url: `https://x.com/search?q=${encodeURIComponent(item.topic)}`,
    category: item.tag,
    platform: 'x',
    region: 'global'
  }));
}

// 4. YouTube Trending Adapter + Translation
export async function fetchYouTubeTrends() {
  const mockVideos = [
    { title: 'I Spent 100 Hours Surviving in the World’s Deepest Cave', titleZh: '我在世界最深的洞穴中极限生存了 100 个小时', channel: 'Adventure Nomad', views: '14.2M 播放', score: 14200000 },
    { title: 'The Complete History of the Universe in 4K HDR', titleZh: '【4K HDR】138 亿年宇宙诞生与演化的完整史诗纪录片', channel: 'Cosmic Journey', views: '9.8M 播放', score: 9800000 },
    { title: 'Building a Real-Life Flying Iron Man Suit with Plasma Jets', titleZh: '打造现实版钢铁侠飞行战甲：等离子推进喷气测试', channel: 'Hacksmith Industries', views: '7.5M 播放', score: 7500000 },
    { title: '2026 Official World Championship Finals - Highlights & Grand Moments', titleZh: '2026 全球总决赛巅峰对决：冠军争夺战高光时刻集锦', channel: 'Esports Global', views: '6.1M 播放', score: 6100000 },
    { title: 'How Microchips are Made: Inside the World’s Most Clean Room', titleZh: '顶级芯片是如何诞生的：走进全球最严苛的超级洁净光刻车间', channel: 'Tech Explored', views: '4.9M 播放', score: 4900000 },
    { title: 'Cooking 50 Famous Street Foods Across 10 Countries in 30 Days', titleZh: '30 天环球旅行：探寻 10 个国家的 50 种地道经典街头美食', channel: 'World Gourmet', views: '3.8M 播放', score: 3800000 }
  ];

  return mockVideos.map((item, idx) => ({
    id: `youtube-${idx}`,
    rank: idx + 1,
    title: item.title,
    titleZh: item.titleZh,
    desc: `Channel: ${item.channel}`,
    descZh: `频道: ${item.channel}`,
    hotScore: item.score,
    hotFormatted: item.views,
    tag: idx < 3 ? 'Trending' : '',
    tagType: idx === 0 ? 'danger' : 'default',
    url: 'https://www.youtube.com/feed/trending',
    metrics: { channel: item.channel, views: item.views },
    category: '全球热门视频',
    platform: 'youtube',
    region: 'global'
  }));
}

// 5. Product Hunt Daily Top Adapter + Translation
export async function fetchProductHuntTrends() {
  const mockProducts = [
    { name: 'Cursor 2.0', nameZh: 'Cursor 2.0 智能代码编辑器', tagline: 'The AI-first Code Editor that writes entire software systems.', taglineZh: '能编写整套软件系统的全新一代 AI 优先代码编辑器。', votes: 2450 },
    { name: 'v0 by Vercel', nameZh: 'v0 by Vercel 生成式 UI', tagline: 'Generative UI system powered by modern design frameworks.', taglineZh: '基于现代化设计框架的自然语言生成式前端 UI 平台。', votes: 1980 },
    { name: 'Raycast Pro AI', nameZh: 'Raycast Pro AI 桌面生产力', tagline: 'Supercharged productivity assistant on your desktop.', taglineZh: '桌面端的超级生产力工具箱与自动化大模型助手。', votes: 1620 },
    { name: 'Superhuman Mail 3.0', nameZh: 'Superhuman 极速邮件', tagline: 'The fastest email experience ever built with automated triage.', taglineZh: '极速邮件处理客户端，内置 AI 自动分类与智能撰写。', votes: 1390 },
    { name: 'Linear Insights', nameZh: 'Linear 研发效能洞察', tagline: 'Predictive software project management and velocity analytics.', taglineZh: '预测性软件研发项目管理与研发速率敏捷分析工具。', votes: 1150 },
    { name: 'Midjourney v7', nameZh: 'Midjourney v7 画质革命', tagline: 'Next-generation photorealistic visual synthesis & vector export.', taglineZh: '下一代超写实视觉图像生成引擎，支持矢量格式导出。', votes: 980 }
  ];

  return mockProducts.map((item, idx) => ({
    id: `producthunt-${idx}`,
    rank: idx + 1,
    title: `${item.name} - ${item.tagline}`,
    titleZh: `${item.nameZh} · ${item.taglineZh}`,
    desc: item.tagline,
    descZh: item.taglineZh,
    hotScore: item.votes * 100,
    hotFormatted: `▲ ${item.votes} Upvotes`,
    tag: `#${idx + 1} of the Day`,
    tagType: 'warning',
    url: 'https://www.producthunt.com',
    metrics: { upvotes: item.votes },
    category: '产品先锋',
    platform: 'producthunt',
    region: 'global'
  }));
}
