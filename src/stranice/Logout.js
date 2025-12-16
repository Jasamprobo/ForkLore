import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../komponente/AuthForms.css";

function LogoutButton() {
  // Funkcija za rukovanje odjavom korisnika
  const handleLogout = async () => {
    try {
      // Poziv Firebase funkcije za odjavu korisnika
      await signOut(auth);
      // Obavijest korisnika o uspješnoj odjavi
      alert("Uspješno ste se odjavili.");
    } catch (error) {
      // Uhvati i prijavi grešku ako odjava ne uspije
      console.error("Greška pri odjavi:", error);
    }
  };

  return (
    // Gumb koji pokreće proces odjave kada se klikne
    <button onClick={handleLogout} className="logout-button">
      Odjavi se
    </button>
  );
}

export default LogoutButton;