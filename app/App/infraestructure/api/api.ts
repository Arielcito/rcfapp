import axios from "axios";

export const api = axios.create({
    baseURL: 'http://192.168.1.48:8080/api',
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });