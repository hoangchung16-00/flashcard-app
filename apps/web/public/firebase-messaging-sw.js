// Service worker for FCM background messages
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.notification?.title ?? 'Flashcard';
  const body = data.notification?.body ?? 'Bạn có thẻ cần ôn!';
  event.waitUntil(self.registration.showNotification(title, { body }));
});
