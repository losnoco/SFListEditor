<template>
  <StorageConsent v-if="!consentGranted" @accepted="consentGranted = true" />

  <q-layout v-else view="hHh lpr fFf">
    <q-header>
      <q-toolbar>
        <q-toolbar-title>SFList JSON Editor</q-toolbar-title>

        <div class="row no-wrap items-center q-gutter-xs">
          <q-btn flat dense icon="note_add" @click="newDocument">
            <q-tooltip>New</q-tooltip>
          </q-btn>
          <q-btn flat dense icon="folder_open" @click="openFile">
            <q-tooltip>Open</q-tooltip>
          </q-btn>
          <q-btn flat dense icon="save" @click="saveFile">
            <q-tooltip>Save</q-tooltip>
          </q-btn>

          <q-separator vertical inset class="q-mx-xs" />

          <q-btn
            flat
            dense
            :icon="rightDrawerOpen ? 'code_off' : 'code'"
            @click="rightDrawerOpen = !rightDrawerOpen"
          >
            <q-tooltip>{{ rightDrawerOpen ? 'Hide' : 'Show' }} JSON</q-tooltip>
          </q-btn>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept=".sflist.json,.json"
          style="display: none"
          @change="onFileOpened"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      :width="420"
      bordered
      :breakpoint="0"
    >
      <div class="json-viewer-header row items-center no-wrap q-px-md q-py-sm">
        <span class="sec-label q-mb-none">JSON Output</span>
        <q-space />
        <q-btn
          flat
          dense
          icon="content_copy"
          size="sm"
          @click="copyJson"
        >
          <q-tooltip>Copy to clipboard</q-tooltip>
        </q-btn>
      </div>
      <q-separator />
      <q-scroll-area class="json-scroll">
        <pre class="json-output">{{ store.exportJson }}</pre>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useSflistStore } from 'stores/sflist-store';
import { useSoundbankCacheStore } from 'stores/soundbank-cache-store';
import StorageConsent from 'components/StorageConsent.vue';

const $q = useQuasar();
const store = useSflistStore();
const cacheStore = useSoundbankCacheStore();
const fileInputRef = ref<HTMLInputElement>();
const rightDrawerOpen = ref(true);

const consentGranted = ref(
  localStorage.getItem('storageConsent') === 'granted',
);

onMounted(() => {
  if (consentGranted.value) {
    store.enablePersistence();
    cacheStore.enablePersistence();
  }
});

function newDocument() {
  if (store.dirty) {
    $q.dialog({
      title: 'Unsaved Changes',
      message: 'Discard current document and start fresh?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      store.newDocument();
    });
  } else {
    store.newDocument();
  }
}

function openFile() {
  fileInputRef.value?.click();
}

async function onFileOpened(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    store.loadFromJson(text, file.name);
    $q.notify({ type: 'positive', message: `Opened ${file.name}` });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: `Failed to parse: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  input.value = '';
}

function saveFile() {
  const json = store.toJson();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = store.currentFileName ?? 'untitled.sflist.json';
  a.click();
  URL.revokeObjectURL(url);
  store.dirty = false;
}

function copyJson() {
  void navigator.clipboard.writeText(store.exportJson).then(() => {
    $q.notify({ type: 'positive', message: 'Copied to clipboard' });
  });
}
</script>

<style scoped>
.json-viewer-header {
  min-height: 40px;
}

.json-viewer-header .sec-label {
  margin-bottom: 0;
}

.json-scroll {
  height: calc(100vh - 52px - 41px);
}

.json-output {
  font-family: 'Iosevka LoSnoCo NoLig Web', monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
  padding: 12px 16px;
  white-space: pre;
  color: var(--text);
}
</style>
