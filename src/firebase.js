import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6T_sCz6dz0TfIwNdqBn6HuLkEZkg_M7w",
  authDomain: "online-voting-system-59410.firebaseapp.com",
  projectId: "online-voting-system-59410",
  storageBucket: "online-voting-system-59410.firebasestorage.app",
  messagingSenderId: "1021438369226",
  appId: "1:1021438369226:web:0107536a8e34765de2c333"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
