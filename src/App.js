import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { AuthProvider, useAuth } from "./komponente/AuthContext";

import Recepti from "./stranice/Recepti";
import DodajRecept from "./stranice/DodajRecept";
import DetaljiRecepta from "./stranice/DetaljiRecepta";
import Register from "./stranice/Register";
import Login from "./stranice/Login";
import AdminEdit from "./stranice/AdminEdit";
import Pocetna from "./stranice/Pocetna";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Pocetna />} />
          <Route path="/recepti" element={<Recepti />} />
          <Route path="/dodaj" element={<DodajRecept />} />
          <Route path="/recept/:id" element={<DetaljiRecepta />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminEdit />} />
          <Route path="/dodaj/:id" element={<DodajRecept />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

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
    <nav style={{ marginBottom: "1rem" }}>
      <Link to="/">Početna</Link> | <Link to="/recepti">Recepti</Link> | <Link to="/dodaj">Dodaj recept</Link> |{" "}
      {!currentUser ? (
        <>
          <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
        </>
      ) : (
        <>
          <span style={{ marginRight: "10px" }}>
            Pozdrav, {userData?.username || currentUser.displayName || "Korisnik"}
          </span>
          {userData?.role === "admin" && (
            <>
              | <Link to="/admin">Admin panel</Link>{" "}
            </>
          )}
          | <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
}

export default App;
