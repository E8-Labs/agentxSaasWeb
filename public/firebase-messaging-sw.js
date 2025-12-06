// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js')
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js')

// Your Firebase config here
const firebaseConfig = {
  apiKey: 'AIzaSyD5hVMiikqGuwJuuOp9haoClVtMH_3EibM',
  authDomain: 'my-agentx-d27f7.firebaseapp.com',
  projectId: 'my-agentx-d27f7',
  storageBucket: 'my-agentx-d27f7.firebasestorage.app',
  messagingSenderId: '355634409731',
  appId: '1:355634409731:web:2d5fda2073e75cafee3936',
  measurementId: 'G-Y0FBZR2VBW',
}

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig)
// eslint-disable-next-line no-undef
const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  // console.log(
  //     '[firebase-messaging-sw.js] Received background message ',
  //     payload
  // );
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: './agentX.png',
  }
  self.registration.showNotification(notificationTitle, notificationOptions)
})

//test code for psuh notifications when web is open

self.addEventListener('push', (event) => {
  // //console.log;

  if (event.data) {
    const payload = event.data.json()

    const notificationTitle = payload.notification.title
    const notificationOptions = {
      body: payload.notification.body,
      icon: './agentX.png',
    }

    // Show the notification
    event.waitUntil(
      self.registration.showNotification(
        notificationTitle,
        notificationOptions,
      ),
    )
  }
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  // //console.log;

  event.notification.close() // Close the notification

  // Open the URL specified in the notification (if provided)
  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data))
  }
})
