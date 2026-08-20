import axios from 'axios';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://www.zhihu.com/hot'
};

export async function fetchZhihuTrends() {
  try {
    const res = await axios.get('https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50', {
      headers,
      timeout: 6000
    });

    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data.map((item, idx) => {
        const target = item.target || {};
        const detailText = item.detail_text || '';
        // Extract number like "1200 万热度"
        const numMatch = detailText.match(/([\d.]+)\s*万/);
        const hotNum = numMatch ? parseFloat(numMatch[1]) * 10000 : (1000000 - idx * 15000);

        return {
          id: `zhihu-${target.id || idx}`,
          rank: idx + 1,
          title: target.title || '知乎热门问答',
          desc: target.excerpt || '',
          hotScore: hotNum,
          hotFormatted: detailText || `${(hotNum / 10000).toFixed(0)}万热度`,
          tag: idx < 3 ? '热榜' : '',
          tagType: idx === 0 ? 'danger' : idx < 3 ? 'warning' : 'default',
          url: target.id ? `https://www.zhihu.com/question/${target.id}` : 'https://www.zhihu.com/hot',
          metrics: {
            answerCount: target.answer_count || 0,
            commentCount: target.comment_count || 0
          },
          category: '问答',
          platform: 'zhihu'
        };
      });
    }
  } catch (err) {
    console.warn('[Zhihu Adapter] Live fetch error, using fallback stream:', err.message);
  }

  return getFallbackZhihu();
}

function getFallbackZhihu() {
  const mockTopics = [
    { title: '有哪些看似反直觉，但在科学上被反复证实的有趣物理现象？', hot: '4680 万热度', answers: 3820, desc: '量子力学、流体力学以及相对论中有哪些让人惊叹的真实规律？' },
    { title: '深度学习模型规模爆发后，个人开发者和中小型团队有哪些破局路径？', hot: '3920 万热度', answers: 1940, desc: '端侧模型优化、垂直领域应用以及 Agentic 架构下的创新机遇分析。' },
    { title: '如何看待当前新能源汽车行业的智能化下半场竞争？', hot: '3450 万热度', answers: 2610, desc: '高阶智驾、超充网络与座舱生态的综合演进趋势。' },
    { title: '坚持每天运动一小时，坚持半年会有哪些肉眼可见的变化？', hot: '2980 万热度', answers: 4210, desc: '生理机能、专注力提升与精神状态的长期改变。' },
    { title: '从技术演进角度来看，WebAssembly 在未来几年会怎样重塑前端与边缘计算？', hot: '2540 万热度', answers: 890, desc: '高性能计算在浏览器端执行的实际落地场景探讨。' },
    { title: '有哪些让你相见恨晚的高效率工具或方法论？', hot: '2190 万热度', answers: 5120, desc: '涵盖知识管理、时间块规划与自动化辅助工作流。' },
    { title: '在大学期间培养哪些底层能力，能对未来的职业生涯产生深远正向影响？', hot: '1850 万热度', answers: 2340, desc: '解决复杂问题的思维框架、持续自驱力与跨学科学习能力。' },
    { title: '如何科学地建立自己的个人财务与资产配置框架？', hot: '1520 万热度', answers: 1670, desc: '风险收益平衡、现金流管理与长期稳健投资逻辑。' }
  ];

  return mockTopics.map((item, idx) => ({
    id: `zhihu-fallback-${idx}`,
    rank: idx + 1,
    title: item.title,
    desc: item.desc,
    hotScore: 50000000 - idx * 3000000,
    hotFormatted: item.hot,
    tag: idx < 3 ? '热榜' : '',
    tagType: idx === 0 ? 'danger' : idx < 3 ? 'warning' : 'default',
    url: 'https://www.zhihu.com/hot',
    metrics: { answerCount: item.answers, commentCount: Math.round(item.answers * 0.4) },
    category: '深度探讨',
    platform: 'zhihu'
  }));
}
