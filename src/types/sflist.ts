export interface PatchAddress {
  bank: number;
  program?: number;
}

export interface PatchMapping {
  source?: PatchAddress;
  destination: PatchAddress;
}

export interface SoundFontEntry {
  fileName: string;
  gain?: number;
  channels?: number[];
  patchMappings?: PatchMapping[];
}

export interface SFListDocument {
  soundFonts: SoundFontEntry[];
}

export function isIncludeEntry(entry: SoundFontEntry): boolean {
  return entry.fileName.toLowerCase().endsWith('.sflist.json');
}

export function isSfzEntry(entry: SoundFontEntry): boolean {
  return entry.fileName.toLowerCase().endsWith('.sfz');
}

export function getFileType(
  fileName: string,
): 'sf2' | 'sf3' | 'sfz' | 'dls' | 'sflist' | 'sflist-legacy' | 'unknown' {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.sflist.json')) return 'sflist';
  if (lower.endsWith('.sflist')) return 'sflist-legacy';
  if (lower.endsWith('.sf2')) return 'sf2';
  if (lower.endsWith('.sf3')) return 'sf3';
  if (lower.endsWith('.sfz')) return 'sfz';
  if (lower.endsWith('.dls')) return 'dls';
  return 'unknown';
}

export function createEmptyDocument(): SFListDocument {
  return { soundFonts: [] };
}

export function serializeDocument(doc: SFListDocument): string {
  const cleaned = {
    soundFonts: doc.soundFonts.map((entry) => {
      const obj: Record<string, unknown> = { fileName: entry.fileName };
      if (entry.gain !== undefined && entry.gain !== 0) {
        obj.gain = entry.gain;
      }
      if (entry.channels && entry.channels.length > 0) {
        obj.channels = entry.channels;
      }
      if (entry.patchMappings && entry.patchMappings.length > 0) {
        obj.patchMappings = entry.patchMappings.map((m) => {
          const mapping: Record<string, unknown> = {};
          if (m.source) {
            const src: Record<string, number> = {};
            if (m.source.bank !== undefined) src.bank = m.source.bank;
            if (m.source.program !== undefined) src.program = m.source.program;
            if (Object.keys(src).length > 0) mapping.source = src;
          }
          const dst: Record<string, number> = { bank: m.destination.bank };
          if (m.destination.program !== undefined)
            dst.program = m.destination.program;
          mapping.destination = dst;
          return mapping;
        });
      }
      return obj;
    }),
  };
  return JSON.stringify(cleaned, null, 2);
}
