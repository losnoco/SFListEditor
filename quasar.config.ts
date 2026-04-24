import { readFileSync } from 'node:fs';
import { defineConfig } from '#q-app/wrappers';

export default defineConfig(() => {
  const buildTimestamp = new Date().toISOString();
  const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as {
    version: string;
  };

  return {
    boot: [],

    css: ['app.scss'],

    extras: [
      // roboto-font replaced by Inter LoSnoCo loaded via app.scss
      'material-icons',
    ],

    build: {
      target: {
        browser: 'baseline-widely-available',
        node: 'node22',
      },

      typescript: {
        strict: true,
        vueShim: true,
      },

      env: {
        BUILD_TIMESTAMP: buildTimestamp,
        APP_VERSION: version,
      },

      vueRouterMode: 'hash',
      vueDevtools: true,

      vitePlugins: [
        ['vite-plugin-vue-devtools'],
        [
          'vite-plugin-checker',
          {
            vueTsc: true,
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    devServer: {
      open: true,
    },

    framework: {
      config: {
        dark: 'auto',
        loadingBar: {
          color: 'accent',
          size: '8px',
        },
      },

      plugins: [
        'LoadingBar',
        'Dialog',
        'Notify',
      ],
    },

    animations: [],
  };
});
