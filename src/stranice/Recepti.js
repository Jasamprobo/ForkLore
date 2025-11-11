import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link, useLocation } from "react-router-dom";
import "./Recepti.css"

function Recepti() {
  const [recepti, setRecepti] = useState([]);
  const [filtrirani, setFiltrirani] = useState([]);
  const [ucitavanje, setUcitavanje] = useState(true);

  const [search, setSearch] = useState("");
  const [kuhinja, setKuhinja] = useState("");
  const [tag, setTag] = useState("");
  const [vrijeme, setVrijeme] = useState("");

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    async function dohvatRecepata() {
      try {
        const snapshot = await getDocs(collection(db, "recepti"));
        const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRecepti(lista);
        setFiltrirani(lista);
      } catch (error) {
        console.error("⚠️ Greška pri dohvaćanju recepata:", error);
      } finally {
        setUcitavanje(false);
      }
    }
    dohvatRecepata();
  }, []);

  useEffect(() => {
    let filtrirano = recepti.filter((r) =>
      r.naziv.toLowerCase().includes(search.toLowerCase())
    );

    if (kuhinja) filtrirano = filtrirano.filter((r) => r.kuhinja === kuhinja);
    if (tag) filtrirano = filtrirano.filter((r) => r.tagovi?.includes(tag));
    if (vrijeme)
      filtrirano = filtrirano.filter(
        (r) =>
          parseInt(r.vrijemePripreme || 0) <= parseInt(vrijeme)
      );

    setFiltrirani(filtrirano);
  }, [search, kuhinja, tag, vrijeme, recepti]);

  if (ucitavanje) return <p>Učitavanje recepata...</p>;

  return (
    <div className="recepti-container">
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <h2>Recepti iz cijelog svijeta 🌍</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Pretraži po nazivu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={kuhinja} onChange={(e) => setKuhinja(e.target.value)}>
          <option value="">Sve kuhinje</option>
          <option value="Talijanska">Talijanska</option>
          <option value="Meksička">Meksička</option>
          <option value="Japanska">Japanska</option>
          <option value="Indijska">Indijska</option>
        </select>

        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">Svi tagovi</option>
          <option value="Vegetarijansko">Vegetarijansko</option>
          <option value="Desert">Desert</option>
          <option value="Brzo jelo">Brzo jelo</option>
        </select>

        <select value={vrijeme} onChange={(e) => setVrijeme(e.target.value)}>
          <option value="">Bez ograničenja</option>
          <option value="15">Do 15 min</option>
          <option value="30">Do 30 min</option>
          <option value="60">Do 60 min</option>
        </select>
      </div>

      {filtrirani.length > 0 ? (
        <div className="recept-grid">
          {filtrirani.map((recept) => (
            <Link
              key={recept.id}
              to={`/recept/${recept.id}`}
              className="recept-kartica"
            >
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