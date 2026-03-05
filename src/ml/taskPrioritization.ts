/**
 * Smart Task Prioritization using Machine Learning
 * Analyzes task content to predict priority level
 */

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

interface PriorityScore {
  priority: PriorityLevel;
  confidence: number;
  reasoning: string[];
}

// Training data: Keywords and their associated priority weights
const PRIORITY_KEYWORDS = {
  urgent: {
    keywords: ['urgent', 'asap', 'critical', 'emergency', 'immediately', 'now', 'blocker', 'hotfix', 'crash', 'down', 'broken'],
    weight: 4,
  },
  high: {
    keywords: ['important', 'priority', 'deadline', 'soon', 'bug', 'fix', 'issue', 'problem', 'error', 'security', 'production'],
    weight: 3,
  },
  medium: {
    keywords: ['should', 'need', 'update', 'improve', 'enhance', 'refactor', 'optimize', 'review', 'test'],
    weight: 2,
  },
  low: {
    keywords: ['maybe', 'consider', 'nice to have', 'eventually', 'someday', 'minor', 'cosmetic', 'polish', 'cleanup'],
    weight: 1,
  },
};

// Time-related keywords that increase urgency
const TIME_INDICATORS = {
  urgent: ['today', 'tonight', 'this hour', 'right now'],
  high: ['tomorrow', 'this week', 'end of week', 'eow'],
  medium: ['next week', 'this month', 'soon'],
  low: ['next month', 'someday', 'eventually', 'future'],
};

// Action verbs that indicate complexity/priority
const ACTION_COMPLEXITY = {
  high: ['implement', 'build', 'create', 'develop', 'design', 'architect'],
  medium: ['update', 'modify', 'change', 'refactor', 'improve'],
  low: ['document', 'review', 'research', 'explore', 'investigate'],
};

/**
 * Tokenizes and normalizes text for analysis
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Calculates priority score based on keyword matching
 */
function calculateKeywordScore(tokens: string[], text: string): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  // Check priority keywords
  Object.entries(PRIORITY_KEYWORDS).forEach(([level, { keywords, weight }]) => {
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += weight;
        matches.push(`${keyword} (${level})`);
      }
    });
  });

  // Check time indicators (higher weight)
  Object.entries(TIME_INDICATORS).forEach(([level, keywords]) => {
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        const timeWeight = level === 'urgent' ? 5 : level === 'high' ? 4 : level === 'medium' ? 2 : 1;
        score += timeWeight;
        matches.push(`${keyword} (time: ${level})`);
      }
    });
  });

  // Check action complexity
  Object.entries(ACTION_COMPLEXITY).forEach(([level, verbs]) => {
    verbs.forEach(verb => {
      if (tokens.includes(verb)) {
        const complexityWeight = level === 'high' ? 2 : level === 'medium' ? 1 : 0.5;
        score += complexityWeight;
        matches.push(`${verb} (action: ${level})`);
      }
    });
  });

  return { score, matches };
}

/**
 * Analyzes text length and structure
 */
function analyzeTextFeatures(text: string): { score: number; features: string[] } {
  const features: string[] = [];
  let score = 0;

  // Exclamation marks indicate urgency
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 0) {
    score += exclamationCount * 1.5;
    features.push(`${exclamationCount} exclamation mark(s)`);
  }

  // ALL CAPS words indicate urgency
  const capsWords = text.match(/\b[A-Z]{3,}\b/g) || [];
  if (capsWords.length > 0) {
    score += capsWords.length * 2;
    features.push(`${capsWords.length} capitalized word(s)`);
  }

  // Question marks might indicate uncertainty (lower priority)
  const questionCount = (text.match(/\?/g) || []).length;
  if (questionCount > 0) {
    score -= questionCount * 0.5;
    features.push(`${questionCount} question mark(s)`);
  }

  // Very short tasks might be quick wins (medium priority)
  if (text.length < 20) {
    score += 0.5;
    features.push('short task (quick win)');
  }

  // Very long descriptions might be complex (higher priority)
  if (text.length > 100) {
    score += 1;
    features.push('detailed description (complex)');
  }

  return { score, features };
}

/**
 * Converts numerical score to priority level
 */
function scoreToPriority(score: number): PriorityLevel {
  if (score >= 8) return 'urgent';
  if (score >= 5) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

/**
 * Calculates confidence based on number of signals detected
 */
function calculateConfidence(matchCount: number, featureCount: number): number {
  const totalSignals = matchCount + featureCount;
  if (totalSignals >= 5) return 0.9;
  if (totalSignals >= 3) return 0.75;
  if (totalSignals >= 2) return 0.6;
  if (totalSignals >= 1) return 0.5;
  return 0.3; // Low confidence when no clear signals
}

/**
 * Main ML function: Predicts task priority
 */
export function predictTaskPriority(title: string, description: string = ''): PriorityScore {
  const combinedText = `${title} ${description}`.toLowerCase();
  const tokens = tokenize(combinedText);

  // Feature extraction
  const { score: keywordScore, matches } = calculateKeywordScore(tokens, combinedText);
  const { score: featureScore, features } = analyzeTextFeatures(title + ' ' + description);

  // Combine scores
  const totalScore = keywordScore + featureScore;
  const priority = scoreToPriority(totalScore);
  const confidence = calculateConfidence(matches.length, features.length);

  // Build reasoning
  const reasoning: string[] = [];
  if (matches.length > 0) {
    reasoning.push(`Keywords detected: ${matches.slice(0, 3).join(', ')}`);
  }
  if (features.length > 0) {
    reasoning.push(`Features: ${features.join(', ')}`);
  }
  if (reasoning.length === 0) {
    reasoning.push('No strong priority indicators found');
  }

  return {
    priority,
    confidence,
    reasoning,
  };
}

/**
 * Gets a color for priority level (for UI display)
 */
export function getPriorityColor(priority: PriorityLevel): string {
  const colors = {
    urgent: '#dc2626', // red-600
    high: '#ea580c', // orange-600
    medium: '#ca8a04', // yellow-600
    low: '#16a34a', // green-600
  };
  return colors[priority];
}

/**
 * Gets a label for priority level
 */
export function getPriorityLabel(priority: PriorityLevel): string {
  const labels = {
    urgent: '🔴 Urgent',
    high: '🟠 High Priority',
    medium: '🟡 Medium Priority',
    low: '🟢 Low Priority',
  };
  return labels[priority];
}
