<template>
  <q-card style="min-width: 400px">
    <q-card-section>
      <div class="text-h6">{{ isNew ? 'Add' : 'Edit' }} Patch Mapping</div>
    </q-card-section>

    <q-card-section class="q-gutter-md">
      <!-- Destination (always shown) -->
      <div>
        <div class="sec-label">Destination</div>
        <div class="row q-gutter-sm">
          <q-input
            v-model.number="destBank"
            type="number"
            label="Bank"
            dense
            outlined
            :rules="[bankRule]"
            class="col"
          />
          <q-input
            v-model.number="destProgram"
            type="number"
            label="Program"
            dense
            outlined
            hint="Leave empty for all"
            class="col"
            clearable
            @clear="destProgram = undefined"
          />
        </div>
      </div>

      <!-- Source (hidden for SFZ) -->
      <div v-if="!isSfz">
        <div class="sec-label">Source</div>

        <PresetPicker
          v-if="presets.length > 0"
          :presets="presets"
          :model-value="sourceFromPicker"
          class="q-mb-sm"
          @update:model-value="applyPresetPick"
        />

        <div class="row q-gutter-sm">
          <q-input
            v-model.number="srcBank"
            type="number"
            label="Bank"
            dense
            outlined
            hint="Leave empty for all"
            class="col"
            clearable
            @clear="srcBank = undefined"
          />
          <q-input
            v-model.number="srcProgram"
            type="number"
            label="Program"
            dense
            outlined
            hint="Leave empty for all"
            class="col"
            clearable
            @clear="srcProgram = undefined"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancel" v-close-popup />
      <q-btn
        unelevated
        label="Save"
        color="primary"
        :disable="destBank === undefined || destBank === null"
        v-close-popup
        @click="save"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PatchMapping, PatchAddress } from 'src/types/sflist';
import type { CachedPreset } from 'src/types/soundbank-info';
import PresetPicker from './PresetPicker.vue';

const props = defineProps<{
  mapping: PatchMapping | undefined;
  isSfz: boolean;
  presets: CachedPreset[];
  isNew: boolean;
}>();

const emit = defineEmits<{ save: [mapping: PatchMapping] }>();

const destBank = ref<number | undefined>(props.mapping?.destination.bank ?? 0);
const destProgram = ref<number | undefined>(
  props.mapping?.destination.program,
);
const srcBank = ref<number | undefined>(props.mapping?.source?.bank);
const srcProgram = ref<number | undefined>(props.mapping?.source?.program);

const sourceFromPicker = computed<PatchAddress | undefined>(() => {
  if (srcBank.value !== undefined && srcProgram.value !== undefined) {
    return { bank: srcBank.value, program: srcProgram.value };
  }
  return undefined;
});

function applyPresetPick(addr: PatchAddress | undefined) {
  if (addr) {
    srcBank.value = addr.bank;
    srcProgram.value = addr.program;
  } else {
    srcBank.value = undefined;
    srcProgram.value = undefined;
  }
}

function bankRule(val: number | string | null | undefined) {
  if (val === null || val === undefined || val === '') return 'Bank is required';
  return true;
}

function save() {
  const destination: PatchAddress = { bank: destBank.value! };
  if (destProgram.value !== undefined) {
    destination.program = destProgram.value;
  }

  const mapping: PatchMapping = { destination };

  if (!props.isSfz && (srcBank.value !== undefined || srcProgram.value !== undefined)) {
    const source: PatchAddress = { bank: srcBank.value ?? -1 };
    if (srcProgram.value !== undefined) source.program = srcProgram.value;
    mapping.source = source;
  }

  emit('save', mapping);
}
</script>
