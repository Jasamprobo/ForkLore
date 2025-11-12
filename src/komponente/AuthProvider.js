import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// Kreiranje AuthContexta za dijeljenje stanja autentifikacije kroz aplikaciju
const AuthContext = createContext();

// Custom hook za jednostavan pristup AuthContextu
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // State varijable za praćenje stanja autentifikacije
  const [currentUser, setCurrentUser] = useState(null); // Firebase auth korisnik
  const [userData, setUserData] = useState(null);       // Dodatni podaci iz Firestore
  const [loading, setLoading] = useState(true);         // Status učitavanja

  // Efekt za praćenje promjena stanja autentifikacije
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Korisnik je prijavljen - dohvati dodatne podatke iz Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // Ako korisnik nema dokument u Firestore, odjavi ga automatski
          // Ovo sprječava korisnike koji su u Auth ali nemaju podatke u bazi
          await signOut(auth);
          setCurrentUser(null);
          setUserData(null);
          setLoading(false);
          return;
        }

        // Postavi podatke korisnika u state
        setCurrentUser(user);
        setUserData(docSnap.data());
      } else {
        // Korisnik nije prijavljen - resetiraj state
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false); // Završi učitavanje bez obzira na ishod
    });

    // Cleanup funkcija - odjavi listener kada se komponenta unmounta
    return unsubscribe;
  }, []); // Prazan dependency array - pokreće se samo pri mountanju

  // Vrijednost koja se šalje kroz Context
  const value = {
    currentUser,
    userData,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children samo kada je učitavanje završeno */}
      {!loading && children}
    </AuthContext.Provider>
  );
}