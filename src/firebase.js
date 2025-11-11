// Import potrebnih Firebase funkcija
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";  // <--- dodano za Auth

// Tvoja Firebase konfiguracija (kopirano iz konzole)
const firebaseConfig = {
  apiKey: "AIzaSyAH4qzpNddG00TvtC5ofT9YzzybC9vZdoQ",
  authDomain: "forklore-dd2cb.firebaseapp.com",
  databaseURL: "https://forklore-dd2cb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "forklore-dd2cb",
  storageBucket: "forklore-dd2cb.firebasestorage.app",
  messagingSenderId: "202630025202",
  appId: "1:202630025202:web:01355a497bac7ccd68256b",
  measurementId: "G-206H6CM6M9"
};

// Inicijaliziraj Firebase app
const app = initializeApp(firebaseConfig);

// Inicijaliziraj Firestore bazu
const db = getFirestore(app);

// Inicijaliziraj Firebase Auth
const auth = getAuth(app);

export { db, auth };  // <--- exportaj auth zajedno s db
