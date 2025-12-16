import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../komponente/AuthForms.css";

function Register() {
  // State varijable za formu i greške
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Funkcija koja se poziva pri slanju forme
  const handleSubmit = async (e) => {
    e.preventDefault(); // Spriječi default ponašanje forme (refresh stranice)
    setError(""); // Resetiraj greške prije novog pokušaja

    try {
      // 1. Kreiraj novog korisnika u Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Ažuriraj profil korisnika s korisničkim imenom
      await updateProfile(user, { displayName: username });

      // 3. Spremi dodatne podatke o korisniku u Firestore bazu
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        createdAt: new Date(), // Vremenska oznaka kada je korisnik kreiran
      });

      // 4. Preusmjeri korisnika na početnu stranicu nakon uspješne registracije
      navigate("/");
      
    } catch (error) {
      // Uhvati i prikaži grešku ako registracija ne uspije
      setError(error.message);
    }
  };

  return (
    <div className="auth-page-container">  
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Registracija</h2>
          
          {/* Polje za korisničko ime */}
          <input
            type="text"
            placeholder="Korisničko ime"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="auth-input"
          />
          
          {/* Polje za email adresu */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          
          {/* Polje za lozinku */}
          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          
          {/* Gumb za registraciju */}
          <button type="submit" className="auth-button">Registriraj se</button>
          
          {/* Prikaz greške ako postoji */}
          {error && <p className="auth-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Register;