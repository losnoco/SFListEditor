<template>
  <q-page padding>
    <EmptyState
      v-if="store.entryCount === 0"
      @open="openSflist"
      @add="addFileInput?.click()"
    />

    <TransitionGroup
      v-else
      name="entry-list"
      tag="div"
      class="entry-list"
    >
      <SoundFontEntryCard
        v-for="(entry, idx) in store.document.soundFonts"
        :key="getEntryId(entry)"
        :entry="entry"
        :index="idx"
        :total="store.entryCount"
        :loading="loadingFiles.has(entry.fileName)"
        @move-up="store.moveEntry(idx, idx - 1)"
        @move-down="store.moveEntry(idx, idx + 1)"
        @remove="store.removeEntry(idx)"
      />
    </TransitionGroup>

    <q-page-sticky position="bottom-right" :offset="[24, 24]">
      <q-btn
        fab
        icon="add"
        color="accent"
        @click="addFileInput?.click()"
      >
        <q-tooltip>Add SoundFont</q-tooltip>
      </q-btn>
    </q-page-sticky>

    <input
      ref="addFileInput"
      type="file"
      accept=".sf2,.sf3,.sfz,.dls,.sflist.json,.json,.sflist"
      multiple
      style="display: none"
      @change="onFilePicked"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useSflistStore } from 'stores/sflist-store';
import { useSoundbankCacheStore } from 'stores/soundbank-cache-store';
import { getFileType } from 'src/types/sflist';
import { parseLegacySflist } from 'src/utils/sflist-legacy-parser';
import type { SoundFontEntry } from 'src/types/sflist';
import EmptyState from 'components/EmptyState.vue';
import SoundFontEntryCard from 'components/SoundFontEntryCard.vue';

const store = useSflistStore();
const cacheStore = useSoundbankCacheStore();
const addFileInput = ref<HTMLInputElement>();
const loading = ref(false);
const loadingFiles = reactive(new Set<string>());

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (loading.value) {
    e.preventDefault();
  }
}

onMounted(() => window.addEventListener('beforeunload', onBeforeUnload));
onUnmounted(() => window.removeEventListener('beforeunload', onBeforeUnload));

// Stable identity for TransitionGroup animations
let nextId = 0;
const entryIds = new WeakMap<SoundFontEntry, number>();
function getEntryId(entry: SoundFontEntry): number {
  let id = entryIds.get(entry);
  if (id === undefined) {
    id = nextId++;
    entryIds.set(entry, id);
  }
  return id;
}

async function onFilePicked(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files) return;

  loading.value = true;
  try {
    for (const file of files) {
      const name = file.name;
      const type = getFileType(name);

      if (type === 'sflist' || type === 'sflist-legacy') {
        const text = await file.text();
        if (type === 'sflist-legacy') {
          const doc = parseLegacySflist(text);
          store.loadDocument(doc, file.name + '.json');
        } else {
          store.loadFromJson(text, name);
        }
        break;
      }

      store.addEntry({ fileName: name });

      if (type === 'sf2' || type === 'sf3' || type === 'dls') {
        loadingFiles.add(name);
        try {
          await cacheStore.loadAndCache(name, file);
        } finally {
          loadingFiles.delete(name);
        }
      }
    }
  } finally {
    loading.value = false;
  }

  input.value = '';
}

function openSflist() {
  const input = document.querySelector<HTMLInputElement>('[data-open-sflist]');
  input?.click();
}
</script>

<style scoped>
.entry-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-list-move {
  transition: transform 0.3s ease;
}

.entry-list-enter-active {
  transition: all 0.3s ease;
}

.entry-list-leave-active {
  transition: all 0.2s ease;
  position: absolute;
  width: 100%;
}

.entry-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.entry-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
