import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Sekcija o aplikaciji */}
        <div className="footer-section">
          <h3>ForkLore</h3>
          <p>
            Mjesto gdje se svjetske kuhinje spajaju. Istraži, kuhaj i podijeli
            svoje recepte s drugima!
          </p>
        </div>

        {/* Navigacijski linkovi */}
        <div className="footer-section">
          <h4>Brzi linkovi</h4>
          <ul>
            <li><Link to="/">Početna</Link></li>
            <li><Link to="/recepti">Recepti</Link></li>
            <li><Link to="/dodaj">Dodaj recept</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>

        {/* Kontakt informacije */}
        <div className="footer-section">
          <h4>Kontakt</h4>
          <p>Email: <a href="mailto:info@forklore.com">info@forklore.com</a></p>
          <p>Telefon: +385 123 4567</p>
          <p>Adresa: Sisak, Hrvatska</p>
        </div>

        {/* Promotivna sekcija */}
        <div className="footer-section">
          <h4>Brže do namirnica uz Scooterino!</h4>
          <p>
            Brže do namirnica uz Scooterino!
          </p>
        </div>
      </div>

      {/* Donji dio footera s copyrightom */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ForkLore. Sva prava pridržana.</p>
      </div>
    </footer>
  );
}

export default Footer;