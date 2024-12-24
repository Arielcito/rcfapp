import { Platform } from 'react-native';

const ENV = {
  dev: {
    apiUrl: 'http://localhost:8080/api',
    firebase: {
      apiKey: "tu-api-key",
      authDomain: "tu-auth-domain.firebaseapp.com",
      projectId: "tu-project-id",
      storageBucket: "tu-storage-bucket.appspot.com",
      messagingSenderId: "tu-messaging-sender-id",
      appId: "tu-app-id",
      measurementId: "tu-measurement-id"
    }
  },
  prod: {
    apiUrl: 'https://tu-produccion-api.com/api',
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID
    }
  }
};

const getEnvVars = () => {
  if (__DEV__) return ENV.dev;
  return ENV.prod;
};

export default getEnvVars(); 