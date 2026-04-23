/**
 * Utility for caching AI-generated content (Future, Instruction, Reports)
 * to avoid regenerating on every visit.
 */

type CachedContent = {
  content: string;
  generatedAt: number;
  memberId?: string | null;
  lang: "en" | "hi";
};

const getCacheKey = (type: "future" | "instruction" | "report", memberId?: string | null, lang: "en" | "hi" = "en"): string => {
  const memberPart = memberId ? `_member_${memberId}` : "_main";
  return `cached_${type}${memberPart}_${lang}`;
};

/**
 * Get cached content if it exists
 */
export function getCachedContent(
  type: "future" | "instruction" | "report",
  memberId?: string | null,
  lang: "en" | "hi" = "en"
): string | null {
  try {
    const key = getCacheKey(type, memberId, lang);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const parsed: CachedContent = JSON.parse(stored);
    // Cache is valid indefinitely (user can regenerate by clearing cache)
    return parsed.content || null;
  } catch {
    return null;
  }
}

/**
 * Save content to cache
 */
export function setCachedContent(
  type: "future" | "instruction" | "report",
  content: string,
  memberId?: string | null,
  lang: "en" | "hi" = "en"
): void {
  try {
    const key = getCacheKey(type, memberId, lang);
    const data: CachedContent = {
      content,
      generatedAt: Date.now(),
      memberId: memberId || null,
      lang,
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear cached content (useful for regeneration)
 */
export function clearCachedContent(
  type: "future" | "instruction" | "report",
  memberId?: string | null,
  lang?: "en" | "hi"
): void {
  try {
    if (lang) {
      const key = getCacheKey(type, memberId, lang);
      localStorage.removeItem(key);
    } else {
      // Clear both languages
      localStorage.removeItem(getCacheKey(type, memberId, "en"));
      localStorage.removeItem(getCacheKey(type, memberId, "hi"));
    }
  } catch {
    // Ignore
  }
}

