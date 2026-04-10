import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyHayTPrEWR3O4IbsOPnrzohoLOaSXLsE",
  authDomain: "micro-mediator-427111-v9.firebaseapp.com",
  projectId: "micro-mediator-427111-v9",
  storageBucket: "micro-mediator-427111-v9.firebasestorage.app",
  messagingSenderId: "647243420459",
  appId: "1:647243420459:web:fcbaab1f71031e33a0ab6e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
