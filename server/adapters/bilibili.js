import axios from 'axios';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/'
};

export async function fetchBilibiliTrends() {
  try {
    const res = await axios.get('https://api.bilibili.com/x/web-interface/ranking/v2', {
      headers,
      timeout: 6000
    });

    if (res.data && res.data.data && Array.isArray(res.data.data.list)) {
      return res.data.data.list.slice(0, 30).map((item, idx) => {
        const view = item.stat ? item.stat.view : 0;
        const danmaku = item.stat ? item.stat.danmaku : 0;
        const formattedView = view > 10000 ? `${(view / 10000).toFixed(1)}万` : `${view}`;

        return {
          id: `bilibili-${item.bvid || idx}`,
          rank: idx + 1,
          title: item.title || 'B站热门视频',
          desc: item.desc || (item.owner ? `UP主: ${item.owner.name}` : ''),
          cover: item.pic || '',
          hotScore: view,
          hotFormatted: `${formattedView} 播放`,
          tag: idx < 3 ? '热门' : (danmaku > 5000 ? '高弹幕' : ''),
          tagType: idx === 0 ? 'danger' : idx < 3 ? 'warning' : 'default',
          url: item.short_link_v2 || `https://www.bilibili.com/video/${item.bvid}`,
          metrics: {
            view: view,
            danmaku: danmaku,
            upName: item.owner ? item.owner.name : ''
          },
          category: item.tname || '热门',
          platform: 'bilibili'
        };
      });
    }
  } catch (err) {
    console.warn('[Bilibili Adapter] Live fetch error, using fallback stream:', err.message);
  }

  return getFallbackBilibili();
}

function getFallbackBilibili() {
  const mockVideos = [
    { title: '【4K自制】花了半年！我用开源硬件打造了专属AI机械臂！', up: '硬核探索客', view: 4829100, danmaku: 28400, tname: '科技' },
    { title: '2026 年度视觉特效神作解说：光影与美学的终极狂欢', up: '影视剪刀手', view: 3951000, danmaku: 19500, tname: '影视' },
    { title: '耗时200小时！用像素动画重现经典科幻世界全貌', up: '像素大师工作室', view: 3410200, danmaku: 16200, tname: '动画' },
    { title: '全网首测：新一代端侧AI大模型在普通轻薄本上的极限表现', up: '极客实验室', view: 2890400, danmaku: 12400, tname: '数码' },
    { title: '【美食纪录片】寻味江南：藏在弄堂里的百年老手艺味道', up: '食光漫步', view: 2450100, danmaku: 9800, tname: '美食' },
    { title: '手把手教你从零搭建属于自己的智能家居自动化中枢系统', up: '代码工匠', view: 2109800, danmaku: 8500, tname: '知识' },
    { title: '全球绝美自然奇观航拍合集：地球上那些震撼人心的秘境', up: '地理巡礼', view: 1840200, danmaku: 7200, tname: '纪录片' },
    { title: '电子竞技年度高能操作盘点：不可思议的绝地反击瞬间', up: '竞技高光台', view: 1590300, danmaku: 6400, tname: '游戏' }
  ];

  return mockVideos.map((item, idx) => ({
    id: `bilibili-fallback-${idx}`,
    rank: idx + 1,
    title: item.title,
    desc: `UP主: ${item.up}`,
    hotScore: item.view,
    hotFormatted: `${(item.view / 10000).toFixed(1)}万 播放`,
    tag: idx < 3 ? '热门' : '',
    tagType: idx === 0 ? 'danger' : idx < 3 ? 'warning' : 'default',
    url: 'https://www.bilibili.com/v/popular/all',
    metrics: { view: item.view, danmaku: item.danmaku, upName: item.up },
    category: item.tname,
    platform: 'bilibili'
  }));
}
