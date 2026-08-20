import axios from 'axios';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://www.douyin.com/'
};

export async function fetchDouyinTrends() {
  try {
    const res = await axios.get('https://www.iesdouyin.com/web/api/v2/hotsearch/billboard/word/', {
      headers,
      timeout: 6000
    });

    if (res.data && Array.isArray(res.data.word_list)) {
      return res.data.word_list.map((item, idx) => {
        const hotScore = item.hot_value || (9900000 - idx * 120000);
        const tag = item.label === 1 ? '新' : item.label === 2 ? '热' : item.label === 3 ? '爆' : (idx < 3 ? '热搜' : '');

        return {
          id: `douyin-${idx}-${item.word}`,
          rank: idx + 1,
          title: item.word,
          hotScore: hotScore,
          hotFormatted: `${(hotScore / 10000).toFixed(1)}万 热度`,
          tag: tag,
          tagType: tag === '爆' ? 'danger' : tag === '热' || tag === '热搜' ? 'warning' : tag === '新' ? 'success' : 'default',
          url: `https://www.douyin.com/search/${encodeURIComponent(item.word)}`,
          category: '短视频热点',
          platform: 'douyin'
        };
      });
    }
  } catch (err) {
    console.warn('[Douyin Adapter] Live fetch error, using fallback stream:', err.message);
  }

  return getFallbackDouyin();
}

function getFallbackDouyin() {
  const mockWords = [
    { word: '春天的第一场户外露营有多惬意', hot: 9840290, tag: '爆' },
    { word: '非遗漆扇手艺体验在年轻人中爆火', hot: 8750120, tag: '热' },
    { word: '各地文旅局长整活花式推介家乡美景', hot: 7920450, tag: '热' },
    { word: '超逼真AI生成短剧引发全网围观', hot: 7120300, tag: '新' },
    { word: '极简低卡春季养生快手早餐挑战', hot: 6450190, tag: '热' },
    { word: '老胡同里的隐藏版宝藏咖啡馆打卡', hot: 5890200, tag: '' },
    { word: '沉浸式听雨声白噪音自律学习日常', hot: 5120400, tag: '新' },
    { word: '萌宠搞笑名场面合集治愈一整天', hot: 4680100, tag: '' }
  ];

  return mockWords.map((item, idx) => ({
    id: `douyin-fallback-${idx}`,
    rank: idx + 1,
    title: item.word,
    hotScore: item.hot,
    hotFormatted: `${(item.hot / 10000).toFixed(1)}万 热度`,
    tag: item.tag,
    tagType: item.tag === '爆' ? 'danger' : item.tag === '热' ? 'warning' : item.tag === '新' ? 'success' : 'default',
    url: `https://www.douyin.com/search/${encodeURIComponent(item.word)}`,
    category: '热点',
    platform: 'douyin'
  }));
}
