import { fetchWeiboTrends } from './weibo.js';
import { fetchZhihuTrends } from './zhihu.js';
import { fetchBaiduTrends } from './baidu.js';
import { fetchBilibiliTrends } from './bilibili.js';
import { fetchDouyinTrends } from './douyin.js';
import { fetchToutiaoTrends } from './toutiao.js';
import { fetchJuejinTrends, fetchGithubTrends } from './tech.js';
import { 
  fetchXTwitterTrends, 
  fetchRedditTrends, 
  fetchHackerNewsTrends, 
  fetchYouTubeTrends, 
  fetchProductHuntTrends 
} from './international.js';

export const PLATFORMS = {
  // --- 国内主流大盘 ---
  weibo: {
    id: 'weibo',
    name: '微博热搜',
    icon: 'weibo',
    color: '#eb1828',
    category: '综合社交',
    region: 'domestic',
    fetcher: fetchWeiboTrends
  },
  zhihu: {
    id: 'zhihu',
    name: '知乎热榜',
    icon: 'zhihu',
    color: '#0084ff',
    category: '深度问答',
    region: 'domestic',
    fetcher: fetchZhihuTrends
  },
  douyin: {
    id: 'douyin',
    name: '抖音热点',
    icon: 'douyin',
    color: '#fe2c55',
    category: '短视频',
    region: 'domestic',
    fetcher: fetchDouyinTrends
  },
  bilibili: {
    id: 'bilibili',
    name: 'B站热门',
    icon: 'bilibili',
    color: '#00aeec',
    category: '视频弹幕',
    region: 'domestic',
    fetcher: fetchBilibiliTrends
  },
  baidu: {
    id: 'baidu',
    name: '百度热搜',
    icon: 'baidu',
    color: '#2932e1',
    category: '实时检索',
    region: 'domestic',
    fetcher: fetchBaiduTrends
  },
  toutiao: {
    id: 'toutiao',
    name: '今日头条',
    icon: 'toutiao',
    color: '#f85959',
    category: '综合资讯',
    region: 'domestic',
    fetcher: fetchToutiaoTrends
  },
  juejin: {
    id: 'juejin',
    name: '掘金技术',
    icon: 'juejin',
    color: '#1e80ff',
    category: '科技开发',
    region: 'domestic',
    fetcher: fetchJuejinTrends
  },

  // --- 国际海外社区 ---
  x: {
    id: 'x',
    name: 'X (Twitter)',
    icon: 'x',
    color: '#000000',
    category: '全球趋势',
    region: 'global',
    fetcher: fetchXTwitterTrends
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit 热门',
    icon: 'reddit',
    color: '#ff4500',
    category: '全球社区',
    region: 'global',
    fetcher: fetchRedditTrends
  },
  hackernews: {
    id: 'hackernews',
    name: 'Hacker News',
    icon: 'hackernews',
    color: '#ff6600',
    category: '硅谷极客',
    region: 'global',
    fetcher: fetchHackerNewsTrends
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Trending',
    icon: 'youtube',
    color: '#ff0000',
    category: '全球视频',
    region: 'global',
    fetcher: fetchYouTubeTrends
  },
  producthunt: {
    id: 'producthunt',
    name: 'Product Hunt',
    icon: 'producthunt',
    color: '#da552f',
    category: '产品先锋',
    region: 'global',
    fetcher: fetchProductHuntTrends
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    color: '#24292e',
    category: '开源潮流',
    region: 'global',
    fetcher: fetchGithubTrends
  }
};

export async function fetchPlatformTrends(platformId) {
  const config = PLATFORMS[platformId];
  if (!config) throw new Error(`Unknown platform: ${platformId}`);
  return await config.fetcher();
}
