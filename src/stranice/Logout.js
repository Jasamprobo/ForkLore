// components/LogoutButton.js
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Uspješno ste se odjavili.");
      // Po želji možeš redirectati npr. na početnu
      // window.location.href = "/";
    } catch (error) {
      console.error("Greška pri odjavi:", error);
    }
  };

  return (
    <button onClick={handleLogout}>
      Odjavi se
    </button>
  );
}

export default LogoutButton;
