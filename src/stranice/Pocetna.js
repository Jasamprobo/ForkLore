import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import "./Pocetna.css";

function Pocetna() {
  const [popularniRecepti, setPopularniRecepti] = useState([]);
  const [ucitavanje, setUcitavanje] = useState(true);

  useEffect(() => {
    const dohvatiPopularne = async () => {
      try {
        const q = query(collection(db, "recepti"), orderBy("likes", "desc"), limit(3));
        const snapshot = await getDocs(q);
        const recepti = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPopularniRecepti(recepti);
      } catch (error) {
        console.error("Greška pri dohvaćanju popularnih recepata:", error);
      } finally {
        setUcitavanje(false);
      }
    };

    dohvatiPopularne();
  }, []);

  return (
    <div className="pocetna-container">
      <div className="hero-section">
        <h1>ForkLore</h1>
        <p>Istraži svjetske kuhinje i podijeli vlastite recepte s drugima!</p>
      </div>

      <h2>🍲 Popularni recepti</h2>
      {ucitavanje ? (
        <p>Učitavanje recepata...</p>
      ) : popularniRecepti.length > 0 ? (
        <div className="popularni-recepti-grid">
          {popularniRecepti.map((recept) => (
            <Link key={recept.id} to={`/recept/${recept.id}`} className="recept-kartica" title={recept.naziv}>
              {recept.slika && (
                <img
                  src={recept.slika}
                  alt={recept.naziv}
                  className="recept-slika"
                />
              )}
              <div className="recept-info">
                <h3>{recept.naziv}</h3>
                <p className="lajkovi">❤️ {recept.likes?.length || 0}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>Nema dostupnih recepata.</p>
      )}

      <div className="svi-recepti-link-container">
        <Link to="/recepti" className="svi-recepti-link">
          Pogledaj sve recepte
        </Link>
      </div>
    </div>
  );
}

export default Pocetna;
