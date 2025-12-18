// Import potrebnih Firebase funkcija
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";  // <--- dodano za Auth


// Firebase konfiguracija - podaci za povezivanje s Firebase projektom
// Ovi podaci su jedinstveni za svaki Firebase projekt
const firebaseConfig = {
  apiKey: "AIzaSyAH4qzpNddG00TvtC5ofT9YzzybC9vZdoQ",           // Ključ za pristup API-ju
  authDomain: "forklore-dd2cb.firebaseapp.com",               // Domena za autentifikaciju
  databaseURL: "https://forklore-dd2cb-default-rtdb.europe-west1.firebasedatabase.app", // URL Realtime baze
  projectId: "forklore-dd2cb",                                // ID Firebase projekta
  storageBucket: "forklore-dd2cb.firebasestorage.app",        // Bucket za pohranu datoteka
  messagingSenderId: "202630025202",                          // ID za slanje notifikacija
  appId: "1:202630025202:web:01355a497bac7ccd68256b",         // ID aplikacije
  measurementId: "G-206H6CM6M9"                               // ID za Google Analytics
};

// Inicijaliziraj Firebase aplikaciju s konfiguracijom
// Ovo mora biti pozvano prije korištenja bilo koje Firebase usluge
const app = initializeApp(firebaseConfig);

// Inicijaliziraj Firestore bazu podataka
// Firestore je NoSQL baza podataka za pohranu podataka o receptima
const db = getFirestore(app);

// Inicijaliziraj Firebase Authentication
// Omogućuje registraciju, prijavu i upravljanje korisnicima
const auth = getAuth(app);

// Exportaj inicijalizirane servise kako bi bili dostupni u drugim dijelovima aplikacije
export { db, auth };