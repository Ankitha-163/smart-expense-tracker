// src/utils/categorize.js
// ─────────────────────────────────────────────────────────────
// Auto-categorization engine.
// Matches keywords in expense descriptions to spending categories.
// ─────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: "food",          label: "Food & Dining",    emoji: "🍔", color: "#FF6B6B" },
  { id: "transport",     label: "Transport",         emoji: "🚗", color: "#4ECDC4" },
  { id: "shopping",      label: "Shopping",          emoji: "🛍️", color: "#FFE66D" },
  { id: "entertainment", label: "Entertainment",     emoji: "🎬", color: "#A78BFA" },
  { id: "health",        label: "Health",            emoji: "💊", color: "#34D399" },
  { id: "utilities",     label: "Utilities",         emoji: "⚡", color: "#60A5FA" },
  { id: "education",     label: "Education",         emoji: "📚", color: "#F59E0B" },
  { id: "travel",        label: "Travel",            emoji: "✈️", color: "#F97316" },
  { id: "other",         label: "Other",             emoji: "📦", color: "#94A3B8" },
];

// Keyword → category mapping (lowercase)
const KEYWORD_MAP = {
  food:          ["restaurant","food","pizza","burger","cafe","coffee","lunch","dinner","breakfast","snack","grocery","groceries","swiggy","zomato","uber eats","dominos","kfc","mcdonalds","starbucks","eat","meal","tiffin","biryani","sushi"],
  transport:     ["uber","ola","auto","taxi","bus","metro","train","fuel","petrol","diesel","parking","toll","rapido","cab","commute","ride","rickshaw"],
  shopping:      ["amazon","flipkart","myntra","shopping","cloth","shirt","shoes","bag","dress","purchase","mall","store","market","buy","online"],
  entertainment: ["netflix","spotify","prime","hotstar","movie","cinema","game","gaming","concert","show","theatre","subscription","youtube","music","disney"],
  health:        ["doctor","hospital","medicine","pharmacy","gym","fitness","health","dental","clinic","medical","chemist","apollo","insurance","yoga"],
  utilities:     ["electric","electricity","water","gas","internet","wifi","broadband","phone","mobile","recharge","bill","airtel","jio","bsnl","maintenance"],
  education:     ["book","course","tuition","school","college","fee","udemy","coursera","exam","stationery","pen","notebook","class","coaching"],
  travel:        ["hotel","flight","airbnb","trip","holiday","vacation","makemytrip","goibibo","booking","oyo","travel","tour","resort","visa"],
};

/**
 * Attempts to auto-detect a category from the expense description.
 * Falls back to "other" if no keyword matches.
 * @param {string} description
 * @returns {string} category id
 */
export function autoCategory(description = "") {
  const lower = description.toLowerCase();
  for (const [cat, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return "other";
}

/**
 * Returns the full category object for a given id.
 */
export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
