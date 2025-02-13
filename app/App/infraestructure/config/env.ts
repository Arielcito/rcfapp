import { Platform } from 'react-native';

const ENV = {
  dev: {
    apiUrl: 'http://localhost:3001/api',
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
      apiKey: "AIzaSyC63HcJiZPxNDxCSwFm0258ctV0ILQDjRc",
      authDomain: "rfc-app-11121.firebaseapp.com",
      projectId: "rfc-app-11121",
      storageBucket: "rfc-app-11121.appspot.com",
      messagingSenderId: "12092366512",
      appId: "1:12092366512:web:4322f9e05508567035a575",
      measurementId: "G-4XD97Z168J"
    }
  }
};

const getEnvVars = () => {
  if (__DEV__) return ENV.dev;
  return ENV.prod;
};

export default getEnvVars();

export const API_URL = 'https://localhost:3001/api'; 