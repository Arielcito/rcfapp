import { Platform } from 'react-native';

const ENV = {
  dev: {
    apiUrl: 'http://localhost:8080/api',
    firebase: {
      apiKey: "AIzaSyC63HcJiZPxNDxCSwFm0258ctV0ILQDjRc",
      authDomain: "rfc-app-11121.firebaseapp.com",
      projectId: "rfc-app-11121",
      storageBucket: "rfc-app-11121.appspot.com",
      messagingSenderId: "12092366512",
      appId: "1:12092366512:web:4322f9e05508567035a575",
      measurementId: "G-4XD97Z168J"
    }
  },
  prod: {
    apiUrl: 'https://backoffice.xerato.io/rcf/api',
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

export const API_URL = 'http://localhost:3000/api'; 