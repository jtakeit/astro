export interface Finding { code: string; says: string }
export interface Verdict { findings: Finding[]; ok: boolean; pages: number; shared: boolean; line: string }
export interface LintOptions {
  /** The site's root, holding `jtk/`; the working directory by default. */
  root?: string;
  /** The built pages; `dist` under the root by default. */
  dist?: string;
  /** The address the build is for (`SITE_URL`); empty skips the host checks. */
  siteURL?: string;
  catalogue?: unknown;
  content?: unknown;
}
/** The annotation lint the platform's build runs: the built pages against the content and the catalogue. */
export function lint(options?: LintOptions): Promise<Verdict>;
/** Print the findings the way the build does; 0 when clean, 1 otherwise. */
export function lintCommand(options?: LintOptions): Promise<number>;
export const TAPPABLE: Set<string>;
export const CODES: Readonly<Record<string, string>>;
export function said(code: string, message: string): string;
