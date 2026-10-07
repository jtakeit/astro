export interface Kit {
  kind: string;
  about?: string;
  ask?: string[];
  version?: string;
  catalogue: {
    blocks: Record<string, unknown>[];
    collections: Record<string, unknown>[];
    modules: Record<string, Record<string, string>>;
  };
  settings: Record<string, unknown>;
  entries: { collection: string; slug: string; fields: Record<string, unknown> }[];
}

export const API: string;
export function readKit(file: string): Kit;
export function fetchKit(kind: string, api?: string): Promise<Kit>;
export function loadKit(asked: string, api?: string): Promise<Kit>;
export function checkKit(kit: unknown, from: string): Kit;
export function kitLanguage(locale: string | undefined): 'uk' | 'en' | 'de';
export function kitSettings(kit: Kit): Record<string, unknown>;
export function kitEntries(kit: Kit, locale: string): [string, Record<string, unknown>][];
export function mergeKitIntoCatalogue(catalogue: Record<string, unknown>, kit: Kit): Record<string, unknown>;
export function layKitFiles(target: string, kit: Kit, options?: { locale?: string; catalogue?: boolean }): string[];
