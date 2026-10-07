export const LOCALES: readonly string[];
/** The booking form's words for a language and a scale, as a fresh object. */
export function wordsFor(locale: string, scale?: string): Record<string, string>;
