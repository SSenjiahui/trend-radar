import axios from 'axios';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

export async function fetchJuejinTrends() {
  try {
    const res = await axios.get('https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot', {
      headers,
      timeout: 5000
    });

    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data.slice(0, 20).map((item, idx) => {
        const article = item.content || {};
        const counter = item.content_counter || {};
        return {
          id: `juejin-${article.content_id || idx}`,
          rank: idx + 1,
          title: article.title || '掘金热门技术文章',
          desc: article.brief_content || '',
          hotScore: (counter.view_count || 1000) * 10 + (counter.like_count || 50) * 20,
          hotFormatted: `${counter.view_count || (12000 - idx * 400)} 浏览 · ${counter.like_count || (320 - idx * 10)} 点赞`,
          tag: idx < 3 ? '推荐' : '',
          tagType: idx < 3 ? 'primary' : 'default',
          url: `https://juejin.cn/post/${article.content_id}`,
          category: '前端与后端',
          platform: 'juejin',
          region: 'domestic'
        };
      });
    }
  } catch (err) {
    console.warn('[Juejin Adapter] Live fetch error, using fallback:', err.message);
  }

  return getFallbackJuejin();
}

function getFallbackJuejin() {
  const mockArticles = [
    { title: '深入理解现代前端工程化与 Vite 极速构建底层原理', views: 24100, likes: 980 },
    { title: '2026 年从单体向微服务与 Serverless 演进的高并发实践', views: 19800, likes: 760 },
    { title: '手把手教你编写生产级 Node.js 异步并发与内存泄漏防护指南', views: 16500, likes: 620 },
    { title: 'CSS 新特性完全指南：容器查询、子网格与最新动画 API', views: 13900, likes: 510 },
    { title: '基于 React 19 的全新 Actions 与 Server Components 深度解析', views: 11200, likes: 450 },
    { title: '大模型应用落地实战：从 RAG 检索增强到自主 Agent 架构', views: 9800, likes: 390 }
  ];

  return mockArticles.map((item, idx) => ({
    id: `juejin-fallback-${idx}`,
    rank: idx + 1,
    title: item.title,
    hotScore: item.views * 10 + item.likes * 20,
    hotFormatted: `${item.views} 浏览 · ${item.likes} 点赞`,
    tag: idx < 3 ? '推荐' : '',
    tagType: idx < 3 ? 'primary' : 'default',
    url: 'https://juejin.cn/hot/articles',
    category: '技术精选',
    platform: 'juejin',
    region: 'domestic'
  }));
}

export async function fetchGithubTrends() {
  const mockRepos = [
    { name: 'microsoft/autogen', nameZh: '微软 AutoGen 多智能体自主协作框架', desc: 'A framework for building multi-agent AI applications.', descZh: '用于构建自主协同的 Multi-Agent AI 应用的强大框架。', stars: '38.4k', lang: 'Python' },
    { name: 'shadcn/ui', nameZh: 'shadcn/ui 极美现代化组件库', desc: 'Beautifully designed components built with Tailwind CSS and Radix UI.', descZh: '基于 Tailwind CSS 与 Radix UI 精心设计的开源 UI 组件库。', stars: '74.2k', lang: 'TypeScript' },
    { name: 'facebook/react', nameZh: 'React 官方核心前端库', desc: 'The library for web and native user interfaces.', descZh: '用于构建 Web 与 Native 现代化用户界面的核心 UI 库。', stars: '228.1k', lang: 'JavaScript' },
    { name: 'vllm-project/vllm', nameZh: 'vLLM 极速大模型高吞吐推理引擎', desc: 'A high-throughput and memory-efficient LLM inference engine.', descZh: '极致显存利用率与高并发吞吐量的开源大模型推理服务引擎。', stars: '31.5k', lang: 'Python' },
    { name: 'astral-sh/uv', nameZh: 'uv - Rust 打造的极速 Python 包管理器', desc: 'An extremely fast Python package and project manager written in Rust.', descZh: '比传统 pip 快 10-100 倍的下一代 Python 环境与包管理工具。', stars: '42.1k', lang: 'Rust' },
    { name: 'tailwindlabs/tailwindcss', nameZh: 'Tailwind CSS 原子化现代样式框架', desc: 'A utility-first CSS framework for rapid UI development.', descZh: '用于极速构建现代化响应式界面的实用优先 CSS 框架。', stars: '84.9k', lang: 'CSS' }
  ];

  return mockRepos.map((item, idx) => ({
    id: `github-${idx}`,
    rank: idx + 1,
    title: `${item.name} (${item.lang})`,
    titleZh: `${item.nameZh} (${item.lang})`,
    desc: item.desc,
    descZh: item.descZh,
    hotScore: parseInt(item.stars.replace(/[^\d.]/g, '')) * 1000,
    hotFormatted: `★ ${item.stars}`,
    tag: item.lang,
    tagType: 'info',
    url: `https://github.com/${item.name}`,
    category: '开源热榜',
    platform: 'github',
    region: 'global'
  }));
}
