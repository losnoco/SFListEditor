<template>
  <div>
    <div class="sec-label">Channels</div>
    <div v-for="port in 3" :key="port" class="channel-row q-mb-xs">
      <span class="port-label text-caption" style="color: var(--muted)">
        {{ (port - 1) * 16 + 1 }}&ndash;{{ port * 16 }}
      </span>
      <q-chip
        v-for="ch in 16"
        :key="ch"
        dense
        clickable
        :color="isSelected(channelNum(port, ch)) ? 'primary' : undefined"
        :text-color="isSelected(channelNum(port, ch)) ? 'white' : undefined"
        :outline="!isSelected(channelNum(port, ch))"
        size="sm"
        @click="toggle(channelNum(port, ch))"
      >
        {{ channelNum(port, ch) }}
      </q-chip>
    </div>
    <q-btn
      v-if="selected.length > 0"
      flat
      dense
      size="sm"
      label="Clear all"
      color="negative"
      class="q-mt-xs"
      @click="$emit('update:modelValue', [])"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ modelValue: number[] }>();
const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>();

const selected = computed(() => props.modelValue ?? []);

function channelNum(port: number, ch: number): number {
  return (port - 1) * 16 + ch;
}

function isSelected(ch: number): boolean {
  return selected.value.includes(ch);
}

function toggle(ch: number) {
  const current = [...selected.value];
  const idx = current.indexOf(ch);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(ch);
    current.sort((a, b) => a - b);
  }
  emit('update:modelValue', current);
}
</script>

<style scoped>
.channel-row {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
}

.port-label {
  min-width: 48px;
  font-size: 0.7rem;
}
</style>
