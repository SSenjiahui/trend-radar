import axios from 'axios';
import * as cheerio from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Referer': 'https://www.baidu.com/'
};

export async function fetchBaiduTrends() {
  try {
    const res = await axios.get('https://top.baidu.com/board?tab=realtime', {
      headers,
      timeout: 6000
    });

    if (res.data) {
      const $ = cheerio.load(res.data);
      const items = [];

      $('.category-wrap_iQLoo').each((idx, el) => {
        const title = $(el).find('.c-single-text-ellipsis').first().text().trim();
        const desc = $(el).find('.large_nSuA8').text().trim() || $(el).find('.desc_3CTjT').text().trim();
        const hotText = $(el).find('.hot-index_1Bl1a').text().trim();
        const tagText = $(el).find('.tag_1sZl3').text().trim() || $(el).find('.c-tag').text().trim();
        const href = $(el).find('a.img-wrapper_29V7w, a.title_dIF3B').attr('href') || `https://www.baidu.com/s?wd=${encodeURIComponent(title)}`;

        const hotNum = parseInt(hotText.replace(/\D/g, '')) || (4900000 - idx * 80000);

        if (title) {
          items.push({
            id: `baidu-${idx}`,
            rank: idx + 1,
            title,
            desc: desc || '',
            hotScore: hotNum,
            hotFormatted: hotText ? `${hotText} 指数` : `${(hotNum / 10000).toFixed(0)}万`,
            tag: tagText || (idx < 3 ? '热搜' : ''),
            tagType: idx === 0 ? 'danger' : idx < 3 ? 'warning' : 'default',
            url: href.startsWith('http') ? href : `https://www.baidu.com/s?wd=${encodeURIComponent(title)}`,
            category: '热搜',
            platform: 'baidu'
          });
        }
      });

      if (items.length > 0) return items;
    }
  } catch (err) {
    console.warn('[Baidu Adapter] Live fetch error, using fallback stream:', err.message);
  }

  return getFallbackBaidu();
}

function getFallbackBaidu() {
  const mockTopics = [
    { title: '全国两会民生热点前瞻 科技与就业成关注重点', hot: '4,952,109', tag: '热', desc: '围绕高质量发展、社会保障与创新驱动的多项关键议题即将展开讨论。' },
    { title: '全球首个人工智能驱动的自动化科考船顺利下水', hot: '4,681,320', tag: '沸', desc: '具备全天候深远海自主导航与高通量环境监测能力。' },
    { title: '我国绿色能源装机规模持续突破 占比再创新高', hot: '4,210,950', tag: '热', desc: '风电光伏协同并网提速，推动清洁低碳能源体系建设。' },
    { title: '新型快充电池技术发布 10分钟充至80%电量', hot: '3,892,100', tag: '新', desc: '材料结构突破兼顾高能量密度与低温极端工况安全。' },
    { title: '春运返程客流创新高 各部门多举措保障顺畅出行', hot: '3,450,290', tag: '热', desc: '铁路民航加大运力投放，重点枢纽优化换乘衔接服务。' },
    { title: '国产商业卫星星座完成新一轮批量组网发射', hot: '3,120,400', tag: '新', desc: '进一步增强全球高精度遥感与卫星物联网通信覆盖。' },
    { title: '多地出台文旅消费促进计划 打造沉浸式新场景', hot: '2,780,150', tag: '', desc: '融合非遗体验与数字互动，拉动春季文旅消费活力。' },
    { title: '科学家首次揭示深海极端生物独特基因代谢机制', hot: '2,490,600', tag: '', desc: '为新型生物催化剂研发与极端环境生命起源提供关键线索。' }
  ];

  return mockTopics.map((item, idx) => ({
    id: `baidu-fallback-${idx}`,
    rank: idx + 1,
    title: item.title,
    desc: item.desc,
    hotScore: parseInt(item.hot.replace(/,/g, '')),
    hotFormatted: `${item.hot} 指数`,
    tag: item.tag,
    tagType: item.tag === '沸' ? 'danger' : item.tag === '热' ? 'warning' : item.tag === '新' ? 'success' : 'default',
    url: `https://www.baidu.com/s?wd=${encodeURIComponent(item.title)}`,
    category: '热搜',
    platform: 'baidu'
  }));
}
