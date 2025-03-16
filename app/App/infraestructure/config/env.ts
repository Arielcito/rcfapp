import { Platform } from 'react-native';

// API URL Configuration - Single source of truth
const API_CONFIG = {
  DEV: {
    ANDROID: 'http://192.168.1.38:3001/api',
    IOS: 'http://localhost:3001/api',
  },
  PROD: 'https://backoffice.xerato.io/rcf/api'
};

const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return API_CONFIG.DEV.ANDROID;
  }
  return API_CONFIG.DEV.IOS;
};

const ENV = {
  dev: {
    //apiUrl: 'https://backoffice.xerato.io/rcf/api',
    apiUrl: getApiUrl(),
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
    apiUrl: API_CONFIG.PROD,
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

//export const API_URL = 'https://backoffice.xerato.io/rcf/api'; 
export const API_URL = getApiUrl(); 