<template>
  <q-input
    :model-value="modelValue ?? null"
    type="number"
    label="Gain"
    suffix="dB"
    dense
    outlined
    step="0.1"
    class="gain-input"
    @update:model-value="onUpdate"
  >
    <template #prepend>
      <q-icon name="volume_up" size="xs" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
defineProps<{ modelValue: number | undefined }>();
const emit = defineEmits<{ 'update:modelValue': [value: number | undefined] }>();

function onUpdate(val: string | number | null) {
  if (val === null || val === '') {
    emit('update:modelValue', undefined);
  } else {
    emit('update:modelValue', Number(val));
  }
}
</script>

<style scoped>
.gain-input {
  max-width: 180px;
}
</style>
