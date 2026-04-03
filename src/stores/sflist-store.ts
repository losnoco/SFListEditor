import { defineStore } from 'pinia';
import { watch } from 'vue';
import type {
  SFListDocument,
  SoundFontEntry,
  PatchMapping,
} from 'src/types/sflist';
import { createEmptyDocument, serializeDocument } from 'src/types/sflist';

const STORAGE_KEY = 'sflist-document';

interface SflistState {
  document: SFListDocument;
  currentFileName: string | null;
  dirty: boolean;
}

function loadFromStorage(): SflistState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SflistState;
  } catch {
    // ignore
  }
  return null;
}

export const useSflistStore = defineStore('sflist', {
  state: (): SflistState => {
    const saved = loadFromStorage();
    return (
      saved ?? {
        document: createEmptyDocument(),
        currentFileName: null,
        dirty: false,
      }
    );
  },

  getters: {
    exportJson(state): string {
      return serializeDocument(state.document);
    },
    entryCount(state): number {
      return state.document.soundFonts.length;
    },
  },

  actions: {
    _persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          document: this.document,
          currentFileName: this.currentFileName,
          dirty: this.dirty,
        }),
      );
    },

    enablePersistence() {
      watch(
        () => this.$state,
        () => this._persist(),
        { deep: true },
      );
    },

    newDocument() {
      this.document = createEmptyDocument();
      this.currentFileName = null;
      this.dirty = false;
    },

    loadFromJson(json: string, fileName: string) {
      const parsed = JSON.parse(json) as SFListDocument;
      if (!parsed.soundFonts || !Array.isArray(parsed.soundFonts)) {
        throw new Error('Invalid SFList JSON: missing soundFonts array');
      }
      this.document = parsed;
      this.currentFileName = fileName;
      this.dirty = false;
    },

    addEntry(entry: SoundFontEntry) {
      this.document.soundFonts.push(entry);
      this.dirty = true;
    },

    removeEntry(index: number) {
      this.document.soundFonts.splice(index, 1);
      this.dirty = true;
    },

    moveEntry(fromIndex: number, toIndex: number) {
      const arr = this.document.soundFonts;
      if (
        fromIndex < 0 ||
        fromIndex >= arr.length ||
        toIndex < 0 ||
        toIndex >= arr.length
      )
        return;
      const removed = arr.splice(fromIndex, 1);
      if (removed.length === 0 || !removed[0]) return;
      arr.splice(toIndex, 0, removed[0]);
      this.dirty = true;
    },

    updateEntry(index: number, patch: Partial<SoundFontEntry>) {
      const entry = this.document.soundFonts[index];
      if (!entry) return;
      Object.assign(entry, patch);
      this.dirty = true;
    },

    addPatchMapping(entryIndex: number, mapping: PatchMapping) {
      const entry = this.document.soundFonts[entryIndex];
      if (!entry) return;
      if (!entry.patchMappings) entry.patchMappings = [];
      entry.patchMappings.push(mapping);
      this.dirty = true;
    },

    removePatchMapping(entryIndex: number, mappingIndex: number) {
      const entry = this.document.soundFonts[entryIndex];
      if (!entry?.patchMappings) return;
      entry.patchMappings.splice(mappingIndex, 1);
      if (entry.patchMappings.length === 0) delete entry.patchMappings;
      this.dirty = true;
    },

    updatePatchMapping(
      entryIndex: number,
      mappingIndex: number,
      mapping: PatchMapping,
    ) {
      const entry = this.document.soundFonts[entryIndex];
      if (!entry?.patchMappings?.[mappingIndex]) return;
      entry.patchMappings[mappingIndex] = mapping;
      this.dirty = true;
    },

    toJson(): string {
      return serializeDocument(this.document);
    },
  },
});
