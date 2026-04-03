import { register } from 'register-service-worker';
import { Notify } from 'quasar';

register(process.env.SERVICE_WORKER_FILE, {
  ready() {
    console.log('App is being served from cache by a service worker.');
  },

  cached() {
    console.log('Content has been cached for offline use.');
  },

  updatefound() {
    console.log('New content is downloading.');
  },

  updated(registration) {
    Notify.create({
      message: 'A new version is available.',
      color: 'primary',
      timeout: 0,
      actions: [
        {
          label: 'Refresh',
          color: 'white',
          handler() {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          },
        },
        { label: 'Dismiss', color: 'white' },
      ],
    });
  },

  offline() {
    console.log('No internet connection found. App is running in offline mode.');
  },

  error(err) {
    console.error('Error during service worker registration:', err);
  },
});
