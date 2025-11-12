import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "./AuthContext";
import "./Navigation.css";

function Navigation() {
  // Hookovi za autentifikaciju i navigaciju
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  // Funkcija za odjavu korisnika
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase odjava
      navigate("/"); // Preusmjeri na početnu stranicu nakon odjave
    } catch (error) {
      console.error("Greška pri odjavi:", error);
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Logo / Brand link koji vodi na početnu stranicu */}
        <Link to="/" className="nav-logo">
          ForkLore
        </Link>
        
        {/* Glavni navigacijski linkovi */}
        <div className="nav-links">
          {/* Osnovni linkovi dostupni svima */}
          <Link to="/">Početna</Link>
          <Link to="/recepti">Recepti</Link>
          <Link to="/dodaj">Dodaj recept</Link>
          
          {/* Kontrola prikaza ovisno o tome je li korisnik prijavljen */}
          {!currentUser ? (
            // Prikaz za neprijavljene korisnike
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            // Prikaz za prijavljene korisnike
            <>
              {/* Pozdravna poruka s korisničkim imenom */}
              <span className="nav-user">
                Pozdrav, {userData?.username || currentUser.displayName || "Korisnik"}
              </span>
              
              {/* Admin link - prikazuje se samo administratorima */}
              {userData?.role === "admin" && (
                <Link to="/admin">Admin panel</Link>
              )}
              
              {/* Gumb za odjavu */}
              <button onClick={handleLogout} className="nav-logout">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;