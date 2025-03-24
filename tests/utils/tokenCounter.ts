/**
 * Simple utility to estimate token count for a string.
 * This is a rough approximation - for production use, consider using a proper tokenizer.
 * 
 * @param text The text to count tokens for
 * @returns Estimated token count
 */
export function countTokens(text: string): number {
  // Simple estimation: ~4 characters per token for English text
  // This is a rough approximation
  return Math.ceil(text.length / 4);
}
