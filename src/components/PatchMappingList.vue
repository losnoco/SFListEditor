<template>
  <div>
    <div class="sec-label">Patch Mappings</div>

    <div v-if="!mappings || mappings.length === 0" class="text-caption" style="color: var(--muted)">
      No patch mappings. The entire SoundFont will be loaded as-is.
    </div>

    <q-list v-else dense separator>
      <q-item v-for="(m, idx) in mappings" :key="idx">
        <q-item-section>
          <q-item-label>
            <span v-if="m.source" class="mapping-addr">
              {{ formatAddr(m.source) }}
            </span>
            <span v-else class="text-caption" style="color: var(--muted)">
              All
            </span>
            <q-icon name="arrow_forward" size="xs" class="q-mx-xs" />
            <span class="mapping-addr">{{ formatAddr(m.destination) }}</span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn
              flat
              dense
              round
              icon="edit"
              size="sm"
              @click="editMapping(idx)"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              size="sm"
              color="negative"
              @click="$emit('remove', idx)"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <q-btn
      flat
      dense
      icon="add"
      label="Add Mapping"
      color="primary"
      size="sm"
      class="q-mt-sm"
      :disable="disabled"
      @click="addMapping"
    />

    <q-dialog v-model="dialogOpen">
      <PatchMappingEditor
        :mapping="editingMapping"
        :is-sfz="isSfz"
        :presets="presets"
        :is-new="editingIndex === -1"
        @save="onSave"
      />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PatchMapping, PatchAddress } from 'src/types/sflist';
import type { CachedPreset } from 'src/types/soundbank-info';
import PatchMappingEditor from './PatchMappingEditor.vue';

const props = defineProps<{
  mappings: PatchMapping[] | undefined;
  isSfz: boolean;
  presets: CachedPreset[];
  disabled: boolean;
}>();

const emit = defineEmits<{
  add: [mapping: PatchMapping];
  update: [index: number, mapping: PatchMapping];
  remove: [index: number];
}>();

const dialogOpen = ref(false);
const editingIndex = ref(-1);
const editingMapping = ref<PatchMapping | undefined>(undefined);

function formatAddr(addr: PatchAddress): string {
  const bank = String(addr.bank).padStart(3, '0');
  const prog =
    addr.program !== undefined ? `P${String(addr.program).padStart(3, '0')}` : 'All';
  return `${bank}:${prog}`;
}

function addMapping() {
  editingIndex.value = -1;
  editingMapping.value = undefined;
  dialogOpen.value = true;
}

function editMapping(idx: number) {
  editingIndex.value = idx;
  editingMapping.value = props.mappings?.[idx];
  dialogOpen.value = true;
}

function onSave(mapping: PatchMapping) {
  if (editingIndex.value === -1) {
    emit('add', mapping);
  } else {
    emit('update', editingIndex.value, mapping);
  }
}
</script>

<style scoped>
.mapping-addr {
  font-family: 'Iosevka LoSnoCo NoLig Web', monospace;
  font-size: 0.85rem;
}
</style>
