<template>
  <q-select
    :model-value="selectedOption"
    :options="filteredOptions"
    label="Preset"
    dense
    outlined
    use-input
    emit-value
    map-options
    option-label="label"
    option-value="value"
    :option-disable="(o: DropdownItem) => o.type === 'header'"
    :display-value="displayValue"
    clearable
    @filter="onFilter"
    @update:model-value="onSelect"
  >
    <template #option="{ opt, itemProps }">
      <!-- Group header -->
      <q-item-label
        v-if="opt.type === 'header'"
        header
        class="bank-header"
      >
        {{ opt.label }}
      </q-item-label>

      <!-- Preset item -->
      <q-item v-else v-bind="itemProps">
        <q-item-section>
          <q-item-label class="preset-label">
            <span class="preset-prog">{{ opt.progLabel }}</span>
            {{ opt.name }}
          </q-item-label>
        </q-item-section>
        <q-item-section v-if="opt.isDrum" side>
          <q-badge label="Drum" />
        </q-item-section>
      </q-item>
    </template>

    <template #no-option>
      <q-item>
        <q-item-section style="color: var(--muted)">No presets found</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CachedPreset } from 'src/types/soundbank-info';
import type { PatchAddress } from 'src/types/sflist';

interface HeaderItem {
  type: 'header';
  label: string;
  bankKey: string;
}

interface PresetItem {
  type: 'preset';
  label: string;
  progLabel: string;
  name: string;
  value: PatchAddress;
  isDrum: boolean;
  bankKey: string;
}

type DropdownItem = HeaderItem | PresetItem;

const props = defineProps<{
  presets: CachedPreset[];
  modelValue: PatchAddress | undefined;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: PatchAddress | undefined] }>();

function bankKey(p: CachedPreset): string {
  return `${p.bankMSB}:${p.bankLSB}`;
}

function bankLabel(p: CachedPreset): string {
  const msb = String(p.bankMSB).padStart(3, '0');
  const lsb = String(p.bankLSB).padStart(3, '0');
  if (p.isDrum) return `Bank ${msb}:${lsb} (Drums)`;
  return `Bank ${msb}:${lsb}`;
}

function formatDisplayPreset(p: CachedPreset): string {
  const msb = String(p.bankMSB).padStart(3, '0');
  const lsb = String(p.bankLSB).padStart(3, '0');
  const prog = String(p.program).padStart(3, '0');
  return `${msb}:${lsb} #${prog} ${p.name}`;
}

function buildItems(presets: CachedPreset[]): DropdownItem[] {
  const items: DropdownItem[] = [];
  let lastBank = '';

  for (const p of presets) {
    const bk = bankKey(p);
    if (bk !== lastBank) {
      items.push({ type: 'header', label: bankLabel(p), bankKey: bk });
      lastBank = bk;
    }
    const prog = String(p.program).padStart(3, '0');
    items.push({
      type: 'preset',
      label: formatDisplayPreset(p),
      progLabel: `#${prog}`,
      name: p.name,
      value: { bank: p.bankMSB, program: p.program },
      isDrum: p.isDrum,
      bankKey: bk,
    });
  }

  return items;
}

const allItems = computed<DropdownItem[]>(() => {
  const melodic = props.presets.filter((p) => !p.isDrum);
  const drums = props.presets.filter((p) => p.isDrum);
  return [...buildItems(melodic), ...buildItems(drums)];
});

const filteredOptions = ref<DropdownItem[]>([]);

function onFilter(val: string, update: (fn: () => void) => void) {
  update(() => {
    if (!val) {
      filteredOptions.value = allItems.value;
      return;
    }

    const needle = val.toLowerCase();
    // Filter presets, then re-insert headers for banks that have matches
    const matchingPresets = allItems.value.filter(
      (item): item is PresetItem =>
        item.type === 'preset' && item.label.toLowerCase().includes(needle),
    );

    const result: DropdownItem[] = [];
    let lastBank = '';
    for (const p of matchingPresets) {
      if (p.bankKey !== lastBank) {
        const header = allItems.value.find(
          (h) => h.type === 'header' && h.bankKey === p.bankKey,
        );
        if (header) result.push(header);
        lastBank = p.bankKey;
      }
      result.push(p);
    }

    filteredOptions.value = result;
  });
}

const selectedOption = computed(() => {
  if (!props.modelValue) return null;
  return (
    allItems.value.find(
      (o): o is PresetItem =>
        o.type === 'preset' &&
        o.value.bank === props.modelValue!.bank &&
        o.value.program === props.modelValue!.program,
    ) ?? null
  );
});

const displayValue = computed(() => {
  if (!selectedOption.value) return '';
  return selectedOption.value.label;
});

function onSelect(val: PatchAddress | null) {
  emit('update:modelValue', val ?? undefined);
}
</script>

<style scoped>
.bank-header {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--orange);
  padding: 8px 16px 4px;
}

.preset-label {
  font-size: 0.85rem;
}

.preset-prog {
  font-family: 'Iosevka LoSnoCo NoLig Web', monospace;
  font-size: 0.8rem;
  color: var(--muted);
  margin-right: 6px;
}
</style>
