import axios from 'axios';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://www.toutiao.com/'
};

export async function fetchToutiaoTrends() {
  try {
    const res = await axios.get('https://www.toutiao.com/hot-event/hot-boards/?origin=toutiao_pc', {
      headers,
      timeout: 6000
    });

    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data.map((item, idx) => {
        const hotScore = parseInt(item.HotValue) || (8800000 - idx * 100000);
        return {
          id: `toutiao-${item.ClusterIdStr || idx}`,
          rank: idx + 1,
          title: item.Title || '今日热点',
          hotScore: hotScore,
          hotFormatted: `${(hotScore / 10000).toFixed(0)}万 热度`,
          tag: item.LabelDesc || (idx < 3 ? '热门' : ''),
          tagType: item.LabelDesc === '爆' ? 'danger' : item.LabelDesc === '热' ? 'warning' : 'default',
          url: item.Url || `https://www.toutiao.com/trending/${item.ClusterIdStr}/`,
          category: '资讯',
          platform: 'toutiao'
        };
      });
    }
  } catch (err) {
    console.warn('[Toutiao Adapter] Live fetch error, using fallback stream:', err.message);
  }

  return getFallbackToutiao();
}

function getFallbackToutiao() {
  const mockItems = [
    { title: '推动高质量发展！全国多项重点工程建设进入冲刺阶段', hot: 8940000, tag: '热' },
    { title: '央行最新货币政策执行报告发布：保持流动性充裕', hot: 8120000, tag: '热' },
    { title: '农业农村部：全国春耕备耕扎实推进 种苗农资保障充足', hot: 7450000, tag: '' },
    { title: '全球前沿科技专利排行榜揭晓：中国申请量连续位列前茅', hot: 6890000, tag: '新' },
    { title: '铁路民航加大换乘运力保障 重点枢纽畅通便民', hot: 6120000, tag: '' },
    { title: '智能机器人进入千行百业 助力工业柔性智造升级', hot: 5490000, tag: '新' }
  ];

  return mockItems.map((item, idx) => ({
    id: `toutiao-fallback-${idx}`,
    rank: idx + 1,
    title: item.title,
    hotScore: item.hot,
    hotFormatted: `${(item.hot / 10000).toFixed(0)}万 热度`,
    tag: item.tag,
    tagType: item.tag === '热' ? 'warning' : item.tag === '新' ? 'success' : 'default',
    url: 'https://www.toutiao.com/',
    category: '今日头条',
    platform: 'toutiao'
  }));
}
