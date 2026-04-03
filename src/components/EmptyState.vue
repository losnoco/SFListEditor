<template>
  <div class="empty-state">
    <q-icon name="library_music" size="64px" color="grey-5" />
    <div class="text-h6 q-mt-md" style="color: var(--muted)">
      No SoundFonts yet
    </div>
    <div class="text-caption q-mb-lg" style="color: var(--muted)">
      Open an existing .sflist.json file or add a SoundFont to get started.
      <br />
      The .sflist.json must live in the same directory as your SoundFont files.
    </div>
    <div class="q-gutter-sm">
      <q-btn
        unelevated
        color="primary"
        icon="folder_open"
        label="Open File"
        @click="$emit('open')"
      />
      <q-btn
        outline
        color="primary"
        icon="add"
        label="Add SoundFont"
        @click="$emit('add')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ open: []; add: [] }>();
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}
</style>
