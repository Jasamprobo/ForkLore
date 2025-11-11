import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "./AuthContext";
import "./Navigation.css"; // ← CSS za navigation

function Navigation() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Greška pri odjavi:", error);
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">ForkLore</Link>
        <div className="nav-links">
          <Link to="/">Početna</Link>
          <Link to="/recepti">Recepti</Link>
          <Link to="/dodaj">Dodaj recept</Link>
          {!currentUser ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <span className="nav-user">
                Pozdrav, {userData?.username || currentUser.displayName || "Korisnik"}
              </span>
              {userData?.role === "admin" && (
                <Link to="/admin">Admin panel</Link>
              )}
              <button onClick={handleLogout} className="nav-logout">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;