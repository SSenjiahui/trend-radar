import axios from 'axios';

const translationCache = new Map();

// Built-in high-quality dictionary for special prefixes & tech brands
const termDict = {
  'Show HN:': '【项目展示】',
  'Ask HN:': '【社区提问】',
  'Tell HN:': '【经验分享】',
  'TIL ': '【涨知识】',
  'SpaceXStarship': 'SpaceX 星舰轨道级试飞',
  'Claude 3.7 Sonnet': 'Claude 3.7 Sonnet 混合推理新模型',
  'ChampionsLeague': '欧洲冠军联赛焦点对决',
  'Apple Special Event': '苹果春季特别发布会',
  'Oscars2026': '2026 奥斯卡金像奖颁奖典礼',
  'Quantum Breakthrough': '量子计算核心物理架构突破',
  'BitcoinHalving': '比特币减半与加密市场动态',
  'Next-Gen WebAssembly': '下一代 WebAssembly 规范与高性能渲染',
  'microsoft/autogen': '微软开源多智能体自主协作框架',
  'shadcn/ui': '极致美观的现代化前端组件库',
  'facebook/react': 'React 官方前端核心界面库',
  'vllm-project/vllm': '高吞吐量与显存优化的大模型推理引擎',
  'astral-sh/uv': '基于 Rust 开发的极速 Python 包管理工具',
  'tailwindlabs/tailwindcss': '实用优先的原子化现代 CSS 框架'
};

export async function translateText(text) {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed) return text;

  // 1. Check in-memory cache first
  if (translationCache.has(trimmed)) {
    return translationCache.get(trimmed);
  }

  // 2. Check direct dictionary hit
  if (termDict[trimmed]) {
    translationCache.set(trimmed, termDict[trimmed]);
    return termDict[trimmed];
  }

  // 3. Check prefix special tags (e.g. "Show HN: ...")
  for (const [key, val] of Object.entries(termDict)) {
    if (trimmed.startsWith(key)) {
      const rest = trimmed.slice(key.length).trim();
      const translatedRest = await fetchTranslationOnline(rest);
      const combined = `${val} ${translatedRest || rest}`;
      translationCache.set(trimmed, combined);
      return combined;
    }
  }

  // 4. Try high-speed online engine (Google GTX / MyMemory)
  const onlineResult = await fetchTranslationOnline(trimmed);
  if (onlineResult && onlineResult.trim() !== trimmed) {
    translationCache.set(trimmed, onlineResult.trim());
    return onlineResult.trim();
  }

  // Fallback: return original text
  translationCache.set(trimmed, trimmed);
  return trimmed;
}

async function fetchTranslationOnline(text) {
  if (!text) return text;

  // Method A: Google Translate Web API (High accuracy & fast)
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
    const res = await axios.get(gtxUrl, { timeout: 3500 });
    if (res.data && Array.isArray(res.data[0])) {
      const translated = res.data[0].map(segment => segment[0]).join('');
      if (translated && translated.trim() !== text) {
        return translated.trim();
      }
    }
  } catch (err) {
    // try fallback
  }

  // Method B: MyMemory Free API
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`;
    const res = await axios.get(mmUrl, { timeout: 3000 });
    if (res.data && res.data.responseData && res.data.responseData.translatedText) {
      let result = res.data.responseData.translatedText;
      result = result.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
      if (result && !result.toLowerCase().includes('mymemory') && result.trim() !== text) {
        return result.trim();
      }
    }
  } catch (err) {
    // fallback to original
  }

  return null;
}
