export interface CachedPreset {
  name: string;
  program: number;
  bankMSB: number;
  bankLSB: number;
  isDrum: boolean;
}

export interface CachedSoundBankInfo {
  name: string;
  presets: CachedPreset[];
  cachedAt: number;
}
