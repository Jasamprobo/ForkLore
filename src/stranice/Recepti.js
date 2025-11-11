import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link, useLocation } from "react-router-dom";
import "./Recepti.css";

function Recepti() {
  const [recepti, postaviRecepte] = useState([]);
  const [ucitavanje, postaviUcitavanje] = useState(true);

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);

      // Očisti poruku iz history state da se ne prikazuje opet prilikom navigacije
      window.history.replaceState({}, document.title);

      // Ukloni poruku nakon 4 sekunde
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Funkcija za skraćivanje teksta na određeni broj znakova, dodaje "..." ako je predug
  function skratiTekst(tekst, maxDuzina = 100) {
    if (!tekst) return "";
    return tekst.length > maxDuzina ? tekst.substring(0, maxDuzina) + "..." : tekst;
  }

  useEffect(() => {
    async function dohvatRecepata() {
      try {
        const upit = await getDocs(collection(db, "recepti"));
        const lista = [];
        upit.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        postaviRecepte(lista);
      } catch (error) {
        console.error("⚠️ Greška pri dohvaćanju recepata:", error);
      } finally {
        postaviUcitavanje(false);
      }
    }

    dohvatRecepata();
  }, []);

  if (ucitavanje) {
    return <p>Učitavanje recepata...</p>;
  }

  if (recepti.length === 0) {
    return <p>Nema recepata u bazi.</p>;
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Fiksirana poruka na vrhu */}
      {successMessage && (
        <div
          style={{
            position: "fixed",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "10px 20px",
            borderRadius: "4px",
            border: "1px solid #c3e6cb",
            fontWeight: "bold",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 1000,
            maxWidth: "320px",
            textAlign: "center",
          }}
        >
          {successMessage}
        </div>
      )}

      <div className="recepti-container" style={{ paddingTop: successMessage ? "60px" : "0" }}>
        <h2>Recepti iz cijelog svijeta 🌍</h2>

        {recepti.map((recept) => (
          <Link
            key={recept.id}
            to={`/recept/${recept.id}`}
            className="recept-kartica"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {/* SLIKA NA VRHU */}
            {recept.slika && (
              <img
                src={recept.slika}
                alt={recept.naziv}
                className="recept-slika"
              />
            )}

            <h3>{recept.naziv}</h3>
            <p><strong>Kuhinja:</strong> {recept.kuhinja || "Nepoznato"}</p>
            <p><strong>Vrijeme pripreme:</strong> {recept.vrijemePripreme || "N/A"}</p>
            <p><strong>Tagovi:</strong> {recept.tagovi ? recept.tagovi.join(", ") : "Nema tagova"}</p>

            <div className="opis">
              <p>{skratiTekst(recept.opis, 100)}</p>
            </div>

            {recept.sastojci && (
              <div>
                <h4>Sastojci:</h4>
                <ul>
                  {recept.sastojci.map((s, index) => (
                    <li key={index}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {recept.priprema && (
              <div>
                <h4>Priprema:</h4>
                <p>{skratiTekst(recept.priprema, 100)}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Recepti;
