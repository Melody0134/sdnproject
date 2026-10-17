const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'of', 'to', 'in', 'on', 'for',
  'with', 'as', 'by', 'at', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'this',
  'that', 'these', 'those', 'it', 'its', 'into', 'about', 'such', 'can', 'will', 'shall',
  'may', 'might', 'must', 'should', 'would', 'could', 'not', 'no', 'do', 'does', 'did', 'has',
  'have', 'had', 'we', 'you', 'they', 'he', 'she', 'i', 'his', 'her', 'their', 'our', 'your',
  'của', 'và', 'các', 'những', 'một', 'cho', 'này', 'đã', 'sẽ', 'được', 'không', 'trong',
  'với', 'để', 'khi', 'về', 'như', 'nhưng', 'mà', 'nếu', 'thì', 'vì', 'nên', 'từ', 'tại',
  'trên', 'dưới', 'đó', 'ấy', 'rất', 'cũng', 'hoặc', 'là', 'có', 'người', 'chúng', 'bạn',
  'theo', 'sau', 'trước', 'giữa', 'vào', 'ra', 'lên', 'xuống', 'đang', 'còn', 'chỉ', 'phải',
]);

const tokenize = (text) =>
  (text || '')
    .toLowerCase()
    .normalize('NFC')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

const significantTokens = (text) => tokenize(text).filter((t) => t.length > 3 && !STOPWORDS.has(t));

const uniqueTokenSet = (text) => new Set(significantTokens(text));

const jaccardSimilarity = (a = [], b = []) => {
  const setA = new Set(a.map((v) => v.toLowerCase().trim()));
  const setB = new Set(b.map((v) => v.toLowerCase().trim()));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection += 1;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
};

const cosineSimilarityFromText = (textA, textB) => {
  const tokensA = significantTokens(textA);
  const tokensB = significantTokens(textB);
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const freqA = new Map();
  tokensA.forEach((t) => freqA.set(t, (freqA.get(t) || 0) + 1));
  const freqB = new Map();
  tokensB.forEach((t) => freqB.set(t, (freqB.get(t) || 0) + 1));

  const vocab = new Set([...freqA.keys(), ...freqB.keys()]);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const term of vocab) {
    const va = freqA.get(term) || 0;
    const vb = freqB.get(term) || 0;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const splitSentences = (text) =>
  (text || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

module.exports = {
  STOPWORDS,
  tokenize,
  significantTokens,
  uniqueTokenSet,
  jaccardSimilarity,
  cosineSimilarityFromText,
  splitSentences,
};
