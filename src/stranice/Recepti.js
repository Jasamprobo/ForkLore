import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link, useLocation } from "react-router-dom";
import "./Recepti.css"

function Recepti() {
  // State varijable za recepte i filtere
  const [recepti, setRecepti] = useState([]);        // Svi recepti iz baze
  const [filtrirani, setFiltrirani] = useState([]);  // Recepti filtrirani prema kriterijima
  const [ucitavanje, setUcitavanje] = useState(true); // Status učitavanja

  // State varijable za filtere
  const [search, setSearch] = useState("");          // Pretraga po nazivu
  const [kuhinja, setKuhinja] = useState("");        // Filter po kuhinji
  const [tag, setTag] = useState("");                // Filter po tagu
  const [vrijeme, setVrijeme] = useState("");        // Filter po vremenu pripreme

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");

  // Efekt za prikaz success poruke nakon dodavanja/uređivanja recepta
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Očisti state kako se poruka ne bi ponovno prikazala pri refreshu
      window.history.replaceState({}, document.title);
      // Automatski sakrij poruku nakon 4 sekunde
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Efekt za dohvaćanje svih recepata iz Firestore baze
  useEffect(() => {
    async function dohvatRecepata() {
      try {
        const snapshot = await getDocs(collection(db, "recepti"));
        const lista = snapshot.docs.map((doc) => ({ 
          id: doc.id,           // ID dokumenta iz Firestore
          ...doc.data()         // Svi podaci recepta
        }));
        setRecepti(lista);
        setFiltrirani(lista);   // Inicijalno prikaži sve recepte
      } catch (error) {
        console.error("⚠️ Greška pri dohvaćanju recepata:", error);
      } finally {
        setUcitavanje(false);   // Završi učitavanje bez obzira na uspjeh/neuspjeh
      }
    }
    dohvatRecepata();
  }, []);

  // Efekt za filtriranje recepata kada se promijene filteri
  useEffect(() => {
    let filtrirano = recepti.filter((r) =>
      r.naziv.toLowerCase().includes(search.toLowerCase())
    );

    // Primjeni dodatne filtere ako su postavljeni
    if (kuhinja) filtrirano = filtrirano.filter((r) => r.kuhinja === kuhinja);
    if (tag) filtrirano = filtrirano.filter((r) => r.tagovi?.includes(tag));
    if (vrijeme) {
      filtrirano = filtrirano.filter((r) =>
        parseInt(r.vrijemePripreme || 0) <= parseInt(vrijeme)
      );
    }

    setFiltrirani(filtrirano);
  }, [search, kuhinja, tag, vrijeme, recepti]);

  // Prikaz indikatora učitavanja dok se podaci dohvaćaju
  if (ucitavanje) return <p>Učitavanje recepata...</p>;

  return (
    <div className="recepti-container">
      {/* Prikaz success poruke ako postoji */}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <h2>Recepti iz cijelog svijeta 🌍</h2>

      {/* Traka s filterima za pretragu recepata */}
      <div className="filter-bar">
        {/* Polje za pretragu po nazivu */}
        <input
          type="text"
          placeholder="Pretraži po nazivu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Padajući izbornik za filter po kuhinji */}
        <select value={kuhinja} onChange={(e) => setKuhinja(e.target.value)}>
          <option value="">Sve kuhinje</option>
          <option value="Talijanska">Talijanska</option>
          <option value="Meksička">Meksička</option>
          <option value="Japanska">Japanska</option>
          <option value="Indijska">Indijska</option>
          <option value="Balkanska">Balkanska</option>
        </select>

        {/* Padajući izbornik za filter po tagovima */}
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">Svi tagovi</option>
          <option value="Vegetarijansko">Vegetarijansko</option>
          <option value="Desert">Desert</option>
          <option value="Brzo jelo">Brzo jelo</option>
        </select>

        {/* Padajući izbornik za filter po vremenu pripreme */}
        <select value={vrijeme} onChange={(e) => setVrijeme(e.target.value)}>
          <option value="">Bez ograničenja</option>
          <option value="15">Do 15 min</option>
          <option value="30">Do 30 min</option>
          <option value="60">Do 60 min</option>
        </select>
      </div>

      {/* Prikaz filtriranih recepata ili poruke ako nema rezultata */}
      {filtrirani.length > 0 ? (
        <div className="recept-grid">
          {filtrirani.map((recept) => (
            <Link
              key={recept.id}
              to={`/recept/${recept.id}`}
              className="recept-kartica"
            >
              {/* Slika recepta ako postoji */}
              {recept.slika && (
                <img
                  src={recept.slika}
                  alt={recept.naziv}
                  className="recept-slika"
                />
              )}
              <h3>{recept.naziv}</h3>
              <p><strong>Kuhinja:</strong> {recept.kuhinja || "Nepoznato"}</p>
              <p><strong>Vrijeme:</strong> {recept.vrijemePripreme || "N/A"} min</p>
              <p><strong>Tagovi:</strong> {recept.tagovi?.join(", ") || "Nema"}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p>Nema recepata koji odgovaraju pretrazi.</p>
      )}
    </div>
  );
}

export default Recepti;