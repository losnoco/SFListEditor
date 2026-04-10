import { defineStore } from 'pinia';
import { watch } from 'vue';
import type { CachedPreset, CachedSoundBankInfo } from 'src/types/soundbank-info';

const STORAGE_KEY = 'sflist-soundbank-cache';

interface SoundbankCacheState {
  cache: Record<string, CachedSoundBankInfo>;
}

function loadFromStorage(): SoundbankCacheState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SoundbankCacheState;
  } catch {
    // ignore
  }
  return null;
}

export const useSoundbankCacheStore = defineStore('soundbank-cache', {
  state: (): SoundbankCacheState => {
    const saved = loadFromStorage();
    return saved ?? { cache: {} };
  },

  getters: {
    getInfo:
      (state) =>
      (key: string): CachedSoundBankInfo | undefined =>
        state.cache[key],

    getPresets:
      (state) =>
      (key: string): CachedPreset[] =>
        state.cache[key]?.presets ?? [],

    hasCache:
      (state) =>
      (key: string): boolean =>
        key in state.cache,
  },

  actions: {
    _persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cache: this.cache }));
    },

    enablePersistence() {
      watch(
        () => this.cache,
        () => this._persist(),
        { deep: true },
      );
    },

    async loadAndCache(key: string, file: File): Promise<CachedSoundBankInfo> {
      const { SoundBankLoader } = await import('spessasynth_core');
      const buffer = await file.arrayBuffer();
      const soundBank = SoundBankLoader.fromArrayBuffer(buffer);

      const presets: CachedPreset[] = soundBank.presets
        .map((p) => ({
          name: p.name,
          program: p.program,
          bankMSB: p.bankMSB,
          bankLSB: p.bankLSB,
          isDrum: p.isAnyDrums,
        }))
        .sort((a, b) => {
          if (a.bankMSB !== b.bankMSB) return a.bankMSB - b.bankMSB;
          if (a.bankLSB !== b.bankLSB) return a.bankLSB - b.bankLSB;
          return a.program - b.program;
        });

      const info: CachedSoundBankInfo = {
        name: soundBank.soundBankInfo.name,
        presets,
        cachedAt: Date.now(),
      };

      this.cache[key] = info;
      return info;
    },

    remove(key: string) {
      delete this.cache[key];
    },
  },
});
