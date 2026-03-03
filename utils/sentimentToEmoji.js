/**
 * Sentiment-to-emoji mapping: reusable module for mapping sentiment/emotion text to emojis.
 * Order of keys = match priority (first matching emotion wins). More specific terms should appear first in each list.
 * @module utils/sentimentToEmoji
 */

const SENTIMENT_EMOJI_MAP = {
  // --- Negative (specific first) ---
  angry: {
    emoji: '😠',
    keywords: [
      'angry', 'anger', 'mad', 'furious', 'livid', 'outraged', 'irate', 'wrathful',
      'hostile', 'aggressive', 'aggression', 'combative', 'belligerent', 'confrontational',
      'resentful', 'bitter', 'spiteful', 'vengeful', 'vindictive', 'malicious',
      'enraged', 'incensed', 'infuriated', 'fuming', 'seething', 'heated',
      'temper', 'rage', 'outburst', 'explosive', 'volatile', 'short-tempered',
      'annoyed', 'irritated', 'exasperated', 'aggravated', 'provoked', 'riled',
      'cross', 'indignant', 'offended', 'insulted', 'disrespected', 'belittled',
      'hateful', 'contemptuous', 'scornful', 'disdainful', 'sarcastic', 'cynical',
      'impatient', 'intolerant', 'frustrated', 'fed up', 'sick of', 'had enough',
    ],
  },
  sad: {
    emoji: '😢',
    keywords: [
      'sad', 'sadness', 'sorrow', 'sorrowful', 'unhappy', 'miserable', 'depressed',
      'depression', 'down', 'downcast', 'low', 'blue', 'melancholy', 'gloomy',
      'heartbroken', 'devastated', 'crushed', 'bereaved', 'grieving',
      'grief', 'mourning', 'tearful', 'crying', 'weeping', 'sobbing', 'wailing',
      'disappointed', 'disappointment', 'let down', 'discouraged', 'disheartened',
      'hopeless', 'hopelessness', 'despair', 'despairing', 'despondent', 'forlorn',
      'lonely', 'loneliness', 'isolated', 'abandoned', 'rejected', 'excluded',
      'hurt', 'pain', 'aching', 'empty', 'numb', 'drained', 'exhausted',
      'glum', 'somber', 'doleful', 'woeful', 'wretched', 'dejected', 'crestfallen',
      'regretful', 'remorseful', 'guilty', 'ashamed', 'embarrassed', 'humiliated',
    ],
  },
  anxious: {
    emoji: '😰',
    keywords: [
      'anxious', 'anxiety', 'nervous', 'nervousness', 'worried', 'worry', 'worrying',
      'stressed', 'stress', 'stressed out', 'overwhelmed', 'overwhelm', 'panicked',
      'panic', 'panic attack', 'tense', 'tension', 'on edge', 'jittery', 'jitters',
      'apprehensive', 'uneasy', 'restless', 'agitated', 'fretful', 'fretting',
      'fearful', 'fear', 'afraid', 'scared', 'terrified', 'terror', 'petrified',
      'alarmed', 'alarm', 'startled', 'spooked', 'intimidated', 'daunted',
      'uncertain', 'uncertainty', 'insecure', 'insecurity', 'vulnerable', 'exposed',
      'dread', 'dreadful', 'foreboding', 'trepidation', 'butterflies', 'stage fright',
      'paranoid', 'suspicious', 'distrustful', 'hesitant', 'hesitation', 'second-guessing',
      'edgy', 'keyed up', 'wound up', 'high-strung', 'neurotic', 'fidgety',
    ],
  },
  frustrated: {
    emoji: '😤',
    keywords: [
      'frustrated', 'frustration', 'annoyed', 'irritated', 'exasperated', 'aggravated',
      'impatient', 'impatience', 'stuck', 'blocked', 'hindered', 'obstructed',
      'helpless', 'powerless', 'defeated', 'beaten', 'giving up', 'resigned',
      'stressed', 'under pressure', 'strained', 'stretched', 'at wit\'s end',
      'flustered', 'flustered', 'flummoxed', 'baffled', 'confused', 'confusion',
      'perplexed', 'puzzled', 'lost', 'disoriented', 'bewildered', 'disconcerted',
      'irked', 'miffed', 'peeved', 'riled', 'provoked', 'nettled', 'vexed',
      'dissatisfied', 'discontent', 'unfulfilled', 'unsatisfied', 'disgruntled',
      'stymied', 'thwarted', 'foiled', 'undermined', 'sabotaged', 'setback',
      'deadlock', 'impasse', 'gridlock', 'bottleneck', 'roadblock', 'obstacle',
    ],
  },
  disgusted: {
    emoji: '🤢',
    keywords: [
      'disgusted', 'disgust', 'disgusting', 'revolted', 'revolting', 'repulsed',
      'repulsive', 'repugnant', 'abhorrent', 'loathsome', 'detestable', 'odious',
      'offended', 'offensive', 'appalled', 'appalling', 'horrified', 'horrible',
      'sickened', 'sickening', 'nauseated', 'nauseating', 'grossed out', 'gross',
      'distasteful', 'unpalatable', 'vile', 'foul', 'rotten', 'putrid',
      'contempt', 'contemptuous', 'scorn', 'scornful', 'disdain', 'disdainful',
      'repelled', 'repellent', 'averse', 'aversion', 'antipathy', 'animosity',
      'squeamish', 'sensitive', 'delicate', 'sick', 'ill', 'queasy', 'uneasy',
    ],
  },
  fearful: {
    emoji: '😨',
    keywords: [
      'fearful', 'fear', 'scared', 'terrified', 'terror', 'frightened', 'fright',
      'afraid', 'petrified', 'horrified', 'alarmed', 'panic', 'panicked', 'panicking',
      'intimidated', 'daunted', 'threatened', 'vulnerable', 'exposed', 'defenseless',
      'timid', 'timidity', 'shy', 'cowardly', 'cowardice', 'spineless', 'weak',
      'dread', 'dreadful', 'dreading', 'foreboding', 'ominous', 'sinister',
      'paranoid', 'suspicious', 'distrust', 'wary', 'cautious', 'guarded',
      'shaken', 'rattled', 'spooked', 'startled', 'jumpy', 'skittish',
      'phobia', 'phobic', 'traumatized', 'trauma', 'ptsd', 'triggered',
      'creeped out', 'unnerved', 'unsettled', 'disturbed', 'disturbing',
    ],
  },
  negative: {
    emoji: '😞',
    keywords: [
      'negative', 'negativity', 'pessimistic', 'pessimism', 'cold', 'cold lead', 'not interested', 'disengaged',
      'gloomy', 'bleak',
      'unhappy', 'unpleased', 'displeased', 'dissatisfied', 'discontent', 'discontented',
      'unfavorable', 'unfavorable', 'adverse', 'unfortunate', 'unlucky', 'ill-fated',
      'downcast', 'dejected', 'demoralized', 'discouraged', 'disheartened',
      'rejected', 'rejection', 'dismissed', 'dismissive', 'rebuffed', 'snubbed',
      'uncomfortable', 'uneasy', 'distressed', 'troubled', 'tormented', 'anguished',
      'suffering', 'in pain', 'aching', 'miserable', 'wretched', 'pitiful',
      'bored', 'boredom', 'uninterested', 'apathetic', 'indifferent', 'listless',
      'tired', 'exhausted', 'weary', 'drained', 'burned out', 'fatigued',
      'jealous', 'jealousy', 'envious', 'envy', 'covetous', 'green with envy',
    ],
  },
  surprised: {
    emoji: '😲',
    keywords: [
      'surprised', 'surprise', 'shocked', 'shock', 'astonished', 'astonishment',
      'amazed', 'amazement', 'astounded', 'stunned', 'stunning', 'dumbfounded',
      'flabbergasted', 'bewildered', 'taken aback', 'caught off guard', 'startled',
      'unexpected', 'unanticipated', 'out of the blue', 'bolt from the blue',
      'speechless', 'lost for words', 'wide-eyed', 'open-mouthed', 'gobsmacked',
      'incredulous', 'skeptical', 'doubtful', 'disbelieving', 'unbelieving',
      'perplexed', 'puzzled', 'confused', 'baffled', 'mystified', 'nonplussed',
      'impressed', 'struck', 'moved', 'touched', 'affected', 'awed', 'awe',
      'wowed', 'blown away', 'mind-blown', 'eye-opening', 'revelation', 'revelatory',
    ],
  },
  // --- Positive (hot/engaged = fiery) ---
  hot: {
    emoji: '🔥',
    keywords: [
      'hot', 'hot lead', 'highly engaged', 'highly interested', 'proactive', 'clearly interested',
      'fiery', 'on fire', 'red hot', 'sizzling', 'burning', 'heated', 'heated interest',
    ],
  },
  loving: {
    emoji: '🥰',
    keywords: [
      'loving', 'love', 'loved', 'affectionate', 'affection', 'caring', 'warm',
      'tender', 'tenderness', 'fond', 'fondness', 'devoted', 'devotion', 'adoring',
      'romantic', 'sweet', 'sweetness', 'kind', 'kindness', 'compassionate', 'compassion',
      'empathetic', 'empathy', 'sympathetic', 'sympathy', 'understanding', 'supportive',
      'nurturing', 'nurture', 'gentle', 'gentleness', 'soft', 'soft-hearted',
      'friendly', 'friendship', 'amicable', 'cordial', 'welcoming', 'open-hearted',
      'appreciative', 'appreciate', 'grateful', 'gratitude', 'thankful', 'thanks',
      'admiring', 'admiration', 'respectful', 'respect', 'reverent', 'cherished',
      'close', 'intimate', 'bonded', 'connected', 'attachment', 'attached',
    ],
  },
  excited: {
    emoji: '🤩',
    keywords: [
      'excited', 'excitement', 'enthusiastic', 'enthusiasm', 'eager', 'eagerness',
      'urgent', 'urgency', 'time-sensitive', 'immediate', 'priority', 'high priority', 'asap',
      'thrilled', 'thrilling', 'elated', 'elation', 'ecstatic', 'euphoric', 'euphoria',
      'jubilant', 'jubilation', 'exhilarated', 'exhilarating', 'pumped', 'pumped up',
      'fired up', 'revved up', 'amped', 'amped up', 'psyched', 'stoked', 'hyped',
      'animated', 'lively', 'vivacious', 'spirited', 'high-spirited', 'energetic',
      'passionate', 'passion', 'zealous', 'fervent', 'ardent', 'keen', 'keenness',
      'motivated', 'motivation', 'inspired', 'inspiring', 'inspired', 'driven',
      'optimistic', 'optimism', 'hopeful', 'hope', 'hopefulness', 'expectant',
      'anticipating', 'anticipation', 'looking forward', 'can\'t wait', 'eagerly',
      'exuberant', 'exuberance', 'effervescent', 'bubbly', 'vivacious', 'sparkling',
    ],
  },
  happy: {
    emoji: '😊',
    keywords: [
      'happy', 'happiness', 'joyful', 'joy', 'joyous', 'cheerful', 'cheer', 'cheery',
      'pleased', 'pleasure', 'pleasurable', 'satisfied', 'satisfaction', 'content', 'contented',
      'glad', 'delighted', 'delight', 'charmed', 'amused', 'amusement', 'entertained',
      'smiling', 'grinning', 'beaming', 'radiant', 'glowing', 'bright', 'sunny',
      'positive', 'positivity', 'upbeat', 'lighthearted', 'carefree', 'blithe',
      'merry', 'jolly', 'jovial', 'genial', 'good-humored', 'in good spirits',
      'fulfilled', 'fulfilling', 'gratified', 'gratification', 'rewarded', 'rewarding',
      'blessed', 'fortunate', 'lucky', 'favorable', 'prosperous', 'thriving',
      'relieved', 'relief', 'at ease', 'comfortable', 'relaxed', 'peaceful', 'serene',
      'calm', 'tranquil', 'composed', 'balanced', 'centered', 'grounded', 'steady',
    ],
  },
  confident: {
    emoji: '💪',
    keywords: [
      'confident', 'confidence', 'self-assured', 'assured', 'certain', 'certainty',
      'proud', 'pride', 'prideful', 'accomplished', 'achievement', 'achieving',
      'empowered', 'empowerment', 'capable', 'competent', 'able', 'skilled',
      'strong', 'strength', 'resilient', 'resilience', 'determined', 'determination',
      'bold', 'boldness', 'brave', 'courage', 'courageous', 'fearless', 'dauntless',
      'assertive', 'assertiveness', 'self-confident', 'self-esteem', 'self-worth',
      'optimistic', 'optimism', 'hopeful', 'hopefulness', 'positive outlook',
      'successful', 'success', 'triumphant', 'victorious', 'winning', 'on top',
      'empowered', 'in control', 'capable', 'equal to', 'up to the task', 'ready',
      'assured', 'convinced', 'sure', 'positive', 'definite', 'conclusive',
    ],
  },
  grateful: {
    emoji: '🙏',
    keywords: [
      'grateful', 'gratitude', 'thankful', 'thanks', 'appreciative', 'appreciation',
      'relieved', 'relief', 'relieved', 'blessed', 'fortunate', 'lucky', 'favor',
      'indebted', 'obliged', 'beholden', 'reciprocal', 'giving back', 'paying forward',
      'humbled', 'humble', 'grace', 'gracious', 'graceful', 'mindful', 'mindfulness',
      'content', 'contentment', 'satisfied', 'satisfaction', 'fulfilled', 'fulfillment',
      'peaceful', 'peace', 'at peace', 'serene', 'tranquil', 'calm', 'centered',
      'acknowledging', 'recognizing', 'valuing', 'treasuring', 'cherishing',
      'warm', 'warmth', 'touched', 'moved', 'emotional', 'overwhelmed with gratitude',
      'thank you', 'thanks so much', 'much appreciated', 'deeply grateful', 'forever grateful',
    ],
  },
  neutral: {
    emoji: '😐',
    keywords: [
      'neutral', 'neutrally', 'impartial', 'impartiality', 'unbiased', 'objective',
      'calm', 'calmly', 'composed', 'reserved', 'restrained', 'controlled', 'even',
      'balanced', 'equilibrium', 'steady', 'stable', 'level', 'even-keeled',
      'detached', 'detachment', 'dispassionate', 'unemotional', 'matter-of-fact',
      'formal', 'professional', 'businesslike', 'straightforward', 'direct',
      'informational', 'informative', 'factual', 'fact-based', 'data-driven',
      'routine', 'ordinary', 'usual', 'typical', 'standard', 'conventional',
      'flat', 'monotone', 'expressionless', 'blank', 'poker face', 'stoic',
      'ambivalent', 'mixed', 'unsure', 'uncertain', 'undecided', 'on the fence',
      'guarded', 'cautious', 'careful', 'measured', 'temperate', 'moderate',
      'indifferent', 'apathetic', 'uninterested', 'unmoved', 'unaffected', 'passive',
    ],
  },
}

const DEFAULT_EMOJI = '😐'

/**
 * Normalize sentiment string for matching (lowercase, trim, collapse spaces).
 * @param {string} sentiment
 * @returns {string}
 */
function normalizeSentiment(sentiment) {
  if (sentiment == null || typeof sentiment !== 'string') return ''
  return sentiment.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Get emoji for a sentiment/emotion string. First matching emotion in SENTIMENT_EMOJI_MAP wins.
 * @param {string} sentiment - Raw sentiment or emotion text (e.g. from API)
 * @returns {string|null} Single emoji character or null if no sentiment
 */
export function getSentimentEmoji(sentiment) {
  const normalized = normalizeSentiment(sentiment)
  if (!normalized) return null

  for (const { emoji, keywords } of Object.values(SENTIMENT_EMOJI_MAP)) {
    if (keywords.some((kw) => normalized.includes(kw))) return emoji
  }
  return DEFAULT_EMOJI
}

export { SENTIMENT_EMOJI_MAP }
