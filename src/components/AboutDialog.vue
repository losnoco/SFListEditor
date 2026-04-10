<template>
  <q-dialog v-model="open">
    <q-card style="min-width: 360px; max-width: 480px">
      <q-card-section>
        <div class="text-h6">SFList JSON Editor</div>
        <div class="text-caption text-grey">
          Version {{ appVersion }} &middot; Built {{ buildTime }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <p class="q-mb-sm">
          A visual editor for the SFList JSON SoundFont playlist format.
        </p>
        <p class="q-mb-sm">
          By
          <a href="mailto:kevin@kddlb.cl" class="text-accent" style="text-decoration: none">Kevin L&oacute;pez B.</a>
          &middot; Copyright &copy; 2026
          <a href="https://losno.co" target="_blank" rel="noopener" class="text-accent"
            style="text-decoration: none">LoSnoCo</a>
        </p>
        <p class="q-mb-none">
          Licensed under the
          <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener" class="text-accent"
            style="text-decoration: none">MIT License</a>.
        </p>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-py-sm">
        <div class="row q-gutter-sm">
          <q-btn flat dense no-caps icon="open_in_new" label="GitHub" href="https://github.com/losnoco/SFListEditor"
            target="_blank" type="a" class="text-accent" />
          <q-btn flat dense no-caps icon="open_in_new" label="SFList Spec"
            href="https://gist.github.com/kode54/a7bb01a0db3f2e996145b77f0ca510d5" target="_blank" type="a"
            class="text-accent" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Open-source attributions</div>
        <q-list dense>
          <q-item v-for="dep in dependencies" :key="dep.name" dense class="q-px-none">
            <q-item-section>
              <q-item-label>
                <a :href="dep.url" target="_blank" rel="noopener" class="text-accent" style="text-decoration: none">{{
                  dep.name }}</a>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ dep.license }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="accent" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
const open = defineModel<boolean>({ required: true });

const appVersion = process.env.APP_VERSION;
const buildTime = new Date(process.env.BUILD_TIMESTAMP).toLocaleString();

const dependencies = [
  {
    name: 'Quasar Framework',
    license: 'MIT',
    url: 'https://quasar.dev',
  },
  {
    name: 'Vue.js',
    license: 'MIT',
    url: 'https://vuejs.org',
  },
  {
    name: 'Vue Router',
    license: 'MIT',
    url: 'https://router.vuejs.org',
  },
  {
    name: 'Pinia',
    license: 'MIT',
    url: 'https://pinia.vuejs.org',
  },
  {
    name: 'SpessaSynth Core',
    license: 'Apache-2.0',
    url: 'https://github.com/spessasus/SpessaSynth',
  },
  {
    name: 'register-service-worker',
    license: 'MIT',
    url: 'https://github.com/yyx990803/register-service-worker',
  },
];
</script>
