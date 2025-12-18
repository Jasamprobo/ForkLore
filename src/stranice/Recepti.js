import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Link, useLocation } from "react-router-dom";
import "./Recepti.css";


function Recepti() {
  // ===== STATE =====
  const [recepti, setRecepti] = useState([]);
  const [filtrirani, setFiltrirani] = useState([]);
  const [ucitavanje, setUcitavanje] = useState(true);

  // Filteri
  const [search, setSearch] = useState("");
  const [kuhinja, setKuhinja] = useState("");
  const [tag, setTag] = useState("");
  const [vrijeme, setVrijeme] = useState("");
  const [samoLajkani, setSamoLajkani] = useState(false);
  const [userReactions, setUserReactions] = useState({}); // { recipeId: "like" }

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");

  // ===== SUCCESS MESSAGE =====
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // ===== DOHVAT RECEPATA =====
  useEffect(() => {
    async function dohvatRecepata() {
      try {
        const snapshot = await getDocs(collection(db, "recepti"));
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecepti(lista);
        setFiltrirani(lista);
      } catch (err) {
        console.error("Greška:", err);
      } finally {
        setUcitavanje(false);
      }
    }
    dohvatRecepata();
  }, []);

  // ===== DOHVAT REAKCIJA =====
  useEffect(() => {
    async function dohvatReakcija() {
      const user = auth.currentUser;
      if (!user) {
        setUserReactions({});
        return;
      }
      try {
        const reactionsCol = collection(db, "users", user.uid, "reactions");
        const snapshot = await getDocs(reactionsCol);

        const reakcije = {};
        snapshot.forEach((doc) => {
          reakcije[doc.id] = doc.data().type || "like"; // pretpostavka da je 'type' polje ili samo lajk
        });

        setUserReactions(reakcije);
      } catch (err) {
        console.error("Greška pri dohvaćanju reakcija:", err);
      }
    }

    dohvatReakcija();

    // Opcionalno, ako želiš osvježavati reakcije svaki put kad se korisnik promijeni
    // možeš dodati auth listener (nije uključeno ovdje)
  }, [auth.currentUser]);

  // ===== FILTER LOGIKA =====
  useEffect(() => {
    let filtrirano = recepti.filter((r) =>
      r.naziv.toLowerCase().includes(search.toLowerCase())
    );

    if (kuhinja) filtrirano = filtrirano.filter((r) => r.kuhinja === kuhinja);
    if (tag) filtrirano = filtrirano.filter((r) => r.tagovi?.includes(tag));
    if (vrijeme)
      filtrirano = filtrirano.filter((r) => r.vrijemePripreme === vrijeme);

    if (samoLajkani) {
      filtrirano = filtrirano.filter((r) => userReactions[r.id] === "like");
    }

    setFiltrirani(filtrirano);
  }, [search, kuhinja, tag, vrijeme, samoLajkani, recepti, userReactions]);

  if (ucitavanje) return <p>Učitavanje recepata...</p>;

  return (
    <div className="recepti-container">
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <h2>Recepti iz cijelog svijeta 🌍</h2>

      {/* ===== FILTER BAR ===== */}
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
          <option value="Balkanska">Balkanska</option> 

        </select>

        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">Svi tagovi</option>
          <option value="Vegetarijansko">Vegetarijansko</option>
          <option value="Desert">Desert</option>
          <option value="Brzo jelo">Brzo jelo</option>
        </select>

        <select value={vrijeme} onChange={(e) => setVrijeme(e.target.value)}>
          <option value="">Sva vremena</option>
          <option value="15 min">15 min</option>
          <option value="30 min">30 min</option>
          <option value="60+ min">60+ min</option>
        </select>

        {/* ❤️ Like checkbox */}
        <label className="like-filter">
          <input
            type="checkbox"
            checked={samoLajkani}
            onChange={(e) => setSamoLajkani(e.target.checked)}
          />
          <span>❤️ Omiljeni Recepti</span>
        </label>
      </div>

      {/* ===== RECEPTI ===== */}
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
              <p>
                <strong>Kuhinja:</strong> {recept.kuhinja || "Nepoznato"}
              </p>
              <p>
                <strong>Vrijeme:</strong> {recept.vrijemePripreme || "N/A"}
              </p>
              <p>
                <strong>Tagovi:</strong> {recept.tagovi?.join(", ") || "Nema"}
              </p>
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
