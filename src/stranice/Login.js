import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../komponente/AuthForms.css";

function Login() {
  // State varijable za formu i greške
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Funkcija koja se poziva pri slanju forme za prijavu
  const handleSubmit = async (e) => {
    e.preventDefault(); // Spriječi default ponašanje forme (refresh stranice)
    setError(""); // Resetiraj greške prije novog pokušaja prijave

    try {
      // Pokušaj prijaviti korisnika s emailom i lozinkom
      await signInWithEmailAndPassword(auth, email, password);
      
      // Nakon uspješne prijave, preusmjeri korisnika na početnu stranicu
      navigate("/");
      
    } catch (error) {
      // Uhvati i prikaži grešku ako prijava ne uspije
      setError(error.message);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Prijava</h2>
          
          {/* Polje za unos email adrese */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          
          {/* Polje za unos lozinke */}
          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          
          {/* Gumb za prijavu */}
          <button type="submit" className="auth-button">Prijavi se</button>
          
          {/* Prikaz greške ako postoji (npr. krivi email/lozinka) */}
          {error && <p className="auth-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;