<template>
  <div class="storage-consent">
    <q-card class="consent-card">
      <q-card-section>
        <div class="text-h6">Local Storage</div>
      </q-card-section>

      <q-card-section>
        <p>
          This editor stores your document state and SoundFont metadata in your
          browser's local storage so your work persists between sessions.
        </p>
        <p class="text-caption" style="color: var(--muted)">
          No data is sent to any server. Everything stays on your device.
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat icon="info" @click="aboutOpen = true">
          <q-tooltip>About</q-tooltip>
        </q-btn>
        <q-space />
        <q-btn unelevated label="Allow" color="accent" @click="accept" />
      </q-card-actions>
    </q-card>

    <AboutDialog v-model="aboutOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AboutDialog from 'components/AboutDialog.vue';

const emit = defineEmits<{ accepted: [] }>();
const aboutOpen = ref(false);

function accept() {
  localStorage.setItem('storageConsent', 'granted');
  emit('accepted');
}
</script>

<style scoped>
.storage-consent {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background: var(--bg);
}

.consent-card {
  max-width: 460px;
  width: 100%;
}
</style>
