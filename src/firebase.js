import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDn_DULvg84003Xs2afGqe50xPaCG3UEMs",
  authDomain: "bizorder-871c0.firebaseapp.com",
  projectId: "bizorder-871c0",
  storageBucket: "bizorder-871c0.firebasestorage.app",
  messagingSenderId: "105697065408",
  appId: "1:105697065408:web:bc564551ea31ac7d48b025"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);