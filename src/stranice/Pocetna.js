import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./Pocetna.css";

function Pocetna() {
  // State varijable za dnevno nasumične recepte i status učitavanja
  const [dnevniRecepti, setDnevniRecepti] = useState([]);
  const [ucitavanje, setUcitavanje] = useState(true);

  // Pomoćna funkcija za pseudonasumični odabir temeljen na seed-u
  const odaberiNasumicne = (niz, koliko, seed) => {
    // 1. Generiraj hash od seed stringa (današnjeg datuma)
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; // Pretvori u 32-bitni integer
    }
    
    // 2. Kopiraj niz za manipulaciju
    const kopija = [...niz];
    const rezultat = [];
    
    // Funkcija za generiranje pseudonasumičnog broja temeljenog na seed-u
    const pseudonasumicno = (index) => {
      const x = Math.sin(hash + index) * 10000;
      return x - Math.floor(x);
    };
    
    // 3. Fisher-Yates shuffle algoritam prilagođen za seed
    for (let i = kopija.length - 1; i > 0 && rezultat.length < koliko; i--) {
      const j = Math.floor(pseudonasumicno(i) * (i + 1));
      [kopija[i], kopija[j]] = [kopija[j], kopija[i]];
      rezultat.push(kopija[i]);
    }
    
    // 4. Ako nema dovoljno recepata, dodaj preostale s početka
    if (rezultat.length < koliko) {
      rezultat.push(...kopija.slice(0, koliko - rezultat.length));
    }
    
    return rezultat;
  };

  // Efekt za dohvaćanje dnevnih nasumičnih recepata
  useEffect(() => {
    const dohvatiDnevneNasumicne = async () => {
      try {
        // 1. Generiraj dnevni ključ za konzistentnu nasumičnost
        const danas = new Date();
        const dnevniKljuc = `${danas.getFullYear()}-${danas.getMonth() + 1}-${danas.getDate()}`;
        
        // 2. Dohvati sve recepte iz baze
        const querySnapshot = await getDocs(collection(db, "recepti"));
        const sviRecepti = [];
        
        querySnapshot.forEach((doc) => {
          sviRecepti.push({ id: doc.id, ...doc.data() });
        });
        
        // 3. Odaberi 4 nasumična recepta pomoću dnevnog ključa
        const nasumicniRecepti = odaberiNasumicne(sviRecepti, 4, dnevniKljuc);
        
        // 4. Postavi odabrane recepte u state
        setDnevniRecepti(nasumicniRecepti);
        
        // [OPCIONALNO] Spremi u localStorage za caching
        localStorage.setItem(`dnevniRecepti_${dnevniKljuc}`, JSON.stringify(nasumicniRecepti));
        
      } catch (error) {
        console.error("Greška pri dohvaćanju recepata:", error);
      } finally {
        setUcitavanje(false); // Završi učitavanje bez obzira na uspjeh
      }
    };

    // [OPCIONALNO] Prvo provjeri ima li keširanih dnevnih recepata
    const danas = new Date();
    const dnevniKljuc = `${danas.getFullYear()}-${danas.getMonth() + 1}-${danas.getDate()}`;
    const kesiraniRecepti = localStorage.getItem(`dnevniRecepti_${dnevniKljuc}`);
    
    if (kesiraniRecepti) {
      setDnevniRecepti(JSON.parse(kesiraniRecepti));
      setUcitavanje(false);
    } else {
      dohvatiDnevneNasumicne();
    }
    
  }, []); // Prazan dependency array - pokreće se samo pri mountanju

  return (
    <div className="pocetna-container">
      {/* Hero sekcija - glavni naslov i opis stranice */}
      <div className="hero-section">
        <h1>ForkLore</h1>
        <p>Istraži svjetske kuhinje i podijeli vlastite recepte s drugima!</p>
      </div>

      {/* Naslov s ikonom koja podsjeća na dnevnu promjenu */}
      <h2 className="override-black">
        🎲 Današnji recepti (promjena svakog dana)
      </h2>

      {/* Prikaz učitavanja, recepata ili poruke ako nema recepata */}
      {ucitavanje ? (
        <p>Učitavanje dnevnih recepata...</p>
      ) : dnevniRecepti.length > 0 ? (
        <div className="popularni-recepti-grid">
          {dnevniRecepti.map((recept) => (
            <Link 
              key={recept.id} 
              to={`/recept/${recept.id}`} 
              className="recept-kartica" 
              title={recept.naziv}
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
                {/* Prikaz dodatnih informacija */}
                <div className="recept-detalji">
                  {recept.vrijeme && (
                    <p className="vrijeme">⏱️ {recept.vrijeme} min</p>
                  )}
                  <p className="lajkovi">❤️ {recept.likes?.length || 0}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>Nema dostupnih recepata. Budi prvi koji će dodati recept!</p>
      )}

      {/* Link za prikaz svih recepata */}
      <div className="svi-recepti-link-container">
        <Link to="/recepti" className="svi-recepti-link">
          Pogledaj sve recepte →
        </Link>
      </div>
    </div>
  );
}

export default Pocetna;