import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import "./Pocetna.css";

function Pocetna() {
  // State varijable za popularne recepte i status učitavanja
  const [popularniRecepti, setPopularniRecepti] = useState([]);
  const [ucitavanje, setUcitavanje] = useState(true);

  // Efekt za dohvaćanje popularnih recepata pri učitavanju stranice
  useEffect(() => {
    const dohvatiPopularne = async () => {
      try {
        // Kreiraj query koji dohvaća 3 najpopularnija recepta po broju lajkova
        const q = query(
          collection(db, "recepti"), 
          orderBy("likes", "desc"),  // Sortiraj silazno po broju lajkova
          limit(3)                   // Ograniči na 3 recepta
        );
        
        const snapshot = await getDocs(q);
        // Transformiraj Firestore dokumente u JavaScript objekte
        const recepti = snapshot.docs.map((doc) => ({ 
          id: doc.id,           // ID dokumenta iz baze
          ...doc.data()         // Svi podaci recepta
        }));
        
        setPopularniRecepti(recepti);
      } catch (error) {
        console.error("Greška pri dohvaćanju popularnih recepata:", error);
      } finally {
        setUcitavanje(false);   // Završi učitavanje bez obzira na uspjeh
      }
    };

    dohvatiPopularne();
  }, []); // Prazan dependency array - pokreće se samo pri mountanju

  return (
    <div className="pocetna-container">
      {/* Hero sekcija - glavni naslov i opis stranice */}
      <div className="hero-section">
        <h1>ForkLore</h1>
        <p>Istraži svjetske kuhinje i podijeli vlastite recepte s drugima!</p>
      </div>

      {/* Sekcija popularnih recepata */}
      <h2>🍲 Popularni recepti</h2>
      
      {/* Prikaz učitavanja, recepata ili poruke ako nema recepata */}
      {ucitavanje ? (
        <p>Učitavanje recepata...</p>
      ) : popularniRecepti.length > 0 ? (
        <div className="popularni-recepti-grid">
          {popularniRecepti.map((recept) => (
            <Link 
              key={recept.id} 
              to={`/recept/${recept.id}`} 
              className="recept-kartica" 
              title={recept.naziv} // Tooltip s nazivom recepta
            >
              {/* Prikaz slike recepta ako postoji */}
              {recept.slika && (
                <img
                  src={recept.slika}
                  alt={recept.naziv}
                  className="recept-slika"
                />
              )}
              
              {/* Informacije o receptu */}
              <div className="recept-info">
                <h3>{recept.naziv}</h3>
                {/* Prikaz broja lajkova sa srcem ikonom */}
                <p className="lajkovi">❤️ {recept.likes?.length || 0}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>Nema dostupnih recepata.</p>
      )}

      {/* Link za prikaz svih recepata */}
      <div className="svi-recepti-link-container">
        <Link to="/recepti" className="svi-recepti-link">
          Pogledaj sve recepte
        </Link>
      </div>
    </div>
  );
}

export default Pocetna;