<template>
  <q-card flat bordered class="entry-card">
    <!-- Header row -->
    <q-card-section class="row items-center no-wrap q-py-sm">
      <q-badge :label="fileType.toUpperCase()" class="q-mr-sm" />

      <div class="col" style="min-width: 0">
        <div class="ellipsis" style="font-weight: 500">
          {{ entry.fileName }}
        </div>
        <div v-if="isSf2OrSf3" class="text-caption preset-status">
          <template v-if="loading">
            <q-spinner size="12px" class="q-mr-xs" />
            Loading...
          </template>
          <template v-else-if="hasCache">
            <q-icon name="check_circle" size="14px" color="positive" class="q-mr-xs" />
            {{ presetCount }} presets
            <span v-if="bankName" class="q-ml-xs">&mdash; {{ bankName }}</span>
          </template>
          <template v-else>
            <span style="color: var(--muted)">No preset data loaded</span>
          </template>
        </div>
      </div>

      <div class="row q-gutter-xs no-wrap">
        <q-btn
          flat
          dense
          round
          icon="keyboard_arrow_up"
          size="sm"
          :disable="index === 0"
          @click="$emit('move-up')"
        />
        <q-btn
          flat
          dense
          round
          icon="keyboard_arrow_down"
          size="sm"
          :disable="index === total - 1"
          @click="$emit('move-down')"
        />
        <q-btn
          flat
          dense
          round
          icon="delete"
          size="sm"
          color="negative"
          @click="$emit('remove')"
        />
        <q-btn
          v-if="!isInclude"
          flat
          dense
          round
          :icon="expanded ? 'expand_less' : 'expand_more'"
          size="sm"
          @click="expanded = !expanded"
        />
      </div>
    </q-card-section>

    <!-- Expanded editing area -->
    <q-slide-transition>
      <div v-show="expanded && !isInclude">
        <q-separator />
        <q-card-section class="q-gutter-md">
          <!-- File name -->
          <q-input
            :model-value="entry.fileName"
            label="File path"
            dense
            outlined
            @update:model-value="(v: string | number | null) => updateField('fileName', String(v))"
          />

          <!-- Gain -->
          <GainInput
            :model-value="entry.gain"
            @update:model-value="(v) => updateField('gain', v)"
          />

          <!-- Channels -->
          <ChannelSelector
            :model-value="entry.channels ?? []"
            @update:model-value="(v) => updateField('channels', v.length > 0 ? v : undefined)"
          />

          <!-- Patch Mappings -->
          <PatchMappingList
            :mappings="entry.patchMappings"
            :is-sfz="isSfz"
            :presets="cachedPresets"
            :disabled="loading"
            @add="(m) => store.addPatchMapping(index, m)"
            @update="(i, m) => store.updatePatchMapping(index, i, m)"
            @remove="(i) => store.removePatchMapping(index, i)"
          />
        </q-card-section>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { SoundFontEntry } from 'src/types/sflist';
import { isIncludeEntry, isSfzEntry, getFileType } from 'src/types/sflist';
import { useSflistStore } from 'stores/sflist-store';
import { useSoundbankCacheStore } from 'stores/soundbank-cache-store';
import GainInput from './GainInput.vue';
import ChannelSelector from './ChannelSelector.vue';
import PatchMappingList from './PatchMappingList.vue';

const props = defineProps<{
  entry: SoundFontEntry;
  index: number;
  total: number;
  loading: boolean;
}>();

defineEmits<{
  'move-up': [];
  'move-down': [];
  remove: [];
}>();

const store = useSflistStore();
const cacheStore = useSoundbankCacheStore();

const expanded = ref(false);

const isInclude = computed(() => isIncludeEntry(props.entry));
const isSfz = computed(() => isSfzEntry(props.entry));
const fileType = computed(() => getFileType(props.entry.fileName));
const isSf2OrSf3 = computed(() => fileType.value === 'sf2' || fileType.value === 'sf3');
const hasCache = computed(() => cacheStore.hasCache(props.entry.fileName));
const presetCount = computed(() => cacheStore.getPresets(props.entry.fileName).length);
const bankName = computed(() => cacheStore.getInfo(props.entry.fileName)?.name ?? '');
const cachedPresets = computed(() => cacheStore.getPresets(props.entry.fileName));

function updateField(field: string, value: unknown) {
  store.updateEntry(props.index, { [field]: value });
}
</script>

<style scoped>
.entry-card {
  border-color: var(--border);
  transition: border-color 0.15s;
}

.entry-card:hover {
  border-color: var(--muted);
}

.preset-status {
  display: flex;
  align-items: center;
  color: var(--text);
  font-size: 0.75rem;
  margin-top: 2px;
}
</style>
