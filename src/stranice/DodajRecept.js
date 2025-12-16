import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; 
import "./DodajRecept.css";

function DodajRecept() {
  // Hookovi za rutu i navigaciju
  const { id } = useParams(); // ID recepta ako se radi o uređivanju
  const navigate = useNavigate();

  // State varijable za podatke recepta
  const [naziv, postaviNaziv] = useState("");
  const [opis, postaviOpis] = useState("");
  const [sastojci, postaviSastojke] = useState("");
  const [priprema, postaviPripremu] = useState("");
  const [vrijemePripreme, postaviVrijeme] = useState("");
  const [tagovi, postaviTagove] = useState("");
  const [kuhinja, postaviKuhinju] = useState("");
  const [slike, postaviSlike] = useState([""]); // Niz URL-ova slika
  const [slika, postaviSliku] = useState(""); // Glavna slika (zadržana za kompatibilnost)
  const [poruka, postaviPoruku] = useState("");
  const [loading, postaviLoading] = useState(false);

  // State varijable za autentifikaciju
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Efekt za praćenje stanja autentifikacije korisnika
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (korisnik) => {
      setUser(korisnik);
      setCheckingAuth(false);
    });
    return unsubscribe; // Cleanup funkcija za odjavu listenera
  }, []);

  // Efekt za učitavanje postojećeg recepta kada se uređuje (ako postoji ID)
  useEffect(() => {
    if (id) {
      postaviLoading(true);
      const docRef = doc(db, "recepti", id);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Popuni formu s postojećim podacima recepta
            postaviNaziv(data.naziv || "");
            postaviOpis(data.opis || "");
            postaviSastojke((data.sastojci || []).join(", ")); // Niz -> string
            postaviPripremu(data.priprema || "");
            postaviVrijeme(data.vrijemePripreme || "");
            postaviTagove((data.tagovi || []).join(", ")); // Niz -> string
            postaviKuhinju(data.kuhinja || "");
            
            // Rukovanje slikama - podrška za stare i nove formate
            if (data.slike && data.slike.length > 0) {
              postaviSlike(data.slike); // Novi format (niz slika)
            } else if (data.slika) {
              postaviSlike([data.slika]); // Stari format (jedna slika)
            } else {
              postaviSlike([""]); // Prazan niz ako nema slika
            }
            
            postaviSliku(data.slika || ""); // Zadrži za kompatibilnost
          } else {
            postaviPoruku("Recept nije pronađen.");
          }
        })
        .catch(() => {
          postaviPoruku("Greška pri učitavanju recepta.");
        })
        .finally(() => {
          postaviLoading(false);
        });
    }
  }, [id]);

  // Funkcije za upravljanje višestrukim slikama
  const dodajSliku = () => {
    postaviSlike([...slike, ""]); // Dodaj novo prazno polje za sliku
  };

  const ukloniSliku = (index) => {
    if (slike.length > 1) {
      const noveSlike = slike.filter((_, i) => i !== index);
      postaviSlike(noveSlike);
    }
  };

  const promjeniSliku = (index, url) => {
    const noveSlike = slike.map((slika, i) => i === index ? url : slika);
    postaviSlike(noveSlike);
  };

  // Glavna funkcija za spremanje recepta (dodavanje ili ažuriranje)
  const spremiRecept = async (e) => {
    e.preventDefault();

    // Validacija obaveznih polja
    if (!naziv || !opis || !sastojci || !priprema) {
      postaviPoruku("⚠️ Ispuni sva obavezna polja!");
      return;
    }

    postaviLoading(true);
    postaviPoruku("");

    try {
      // Priprema podataka za spremanje
      const filtriraneSlike = slike.filter(url => url.trim() !== "");
      const receptPodaci = {
        naziv,
        opis,
        sastojci: sastojci.split(",").map((s) => s.trim()), // String -> niz
        priprema,
        vrijemePripreme,
        tagovi: tagovi.split(",").map((t) => t.trim()), // String -> niz
        kuhinja,
        slike: filtriraneSlike,
        slika: filtriraneSlike.length > 0 ? filtriraneSlike[0] : "" // Prva slika kao glavna
      };

      // Ažuriranje postojećeg ili dodavanje novog recepta
      if (id) {
        const docRef = doc(db, "recepti", id);
        await updateDoc(docRef, receptPodaci);
        navigate("/recepti", { 
          state: { successMessage: "✅ Promjene su uspješno spremljene!" } 
        });
      } else {
        await addDoc(collection(db, "recepti"), receptPodaci);
        navigate("/recepti", { 
          state: { successMessage: "✅ Recept uspješno dodan!" } 
        });
      }
    } catch (error) {
      console.error("Greška:", error);
      postaviPoruku("❌ Došlo je do pogreške pri spremanju.");
    } finally {
      postaviLoading(false);
    }
  };

  // Prikaz učitavanja dok se provjerava autentifikacija
  if (checkingAuth || loading) {
    return <p>Učitavanje...</p>;
  }

  // Provjera je li korisnik prijavljen
  if (!user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>⚠️ Morate biti prijavljeni da biste dodali recept.</p>
        <button onClick={() => navigate("/login")}>Prijavi se</button>
        <button onClick={() => navigate("/register")} style={{ marginLeft: "1rem" }}>
          Registriraj se
        </button>
      </div>
    );
  }

  return (
    <div className="forma-container">
      <h2>{id ? "Uredi recept" : "Dodaj novi recept"} 🍲</h2>

      <form onSubmit={spremiRecept} className="forma-recept">
        {/* Polja forme za unos podataka o receptu */}
        <label>Naziv recepta *</label>
        <input
          type="text"
          value={naziv}
          onChange={(e) => postaviNaziv(e.target.value)}
          required
        />

        <label>Kratki opis *</label>
        <input
          type="text"
          value={opis}
          onChange={(e) => postaviOpis(e.target.value)}
          required
        />

        <label>Sastojci (odvojeni zarezom) *</label>
        <textarea
          value={sastojci}
          onChange={(e) => postaviSastojke(e.target.value)}
          placeholder="npr. brašno, jaja, mlijeko"
          required
        />

        <label>Priprema *</label>
        <textarea
          value={priprema}
          onChange={(e) => postaviPripremu(e.target.value)}
          placeholder="Opiši korake pripreme..."
          required
        />

        <label>Vrijeme pripreme</label>
        <input
          type="text"
          value={vrijemePripreme}
          onChange={(e) => postaviVrijeme(e.target.value)}
          placeholder="npr. 45 minuta"
        />

        <label>Tagovi / Kategorije (odvojeni zarezom)</label>
        <input
          type="text"
          value={tagovi}
          onChange={(e) => postaviTagove(e.target.value)}
          placeholder="npr. balkanska, brza jela, vegetarijansko"
        />

        <label>Kuhinja</label>
        <input
          type="text"
          value={kuhinja}
          onChange={(e) => postaviKuhinju(e.target.value)}
          placeholder="Balkanska / Talijanska / Azijska..."
        />

        {/* Sekcija za višestruke slike */}
        <label>Slike (URL-ovi, opcionalno)</label>
        {slike.map((slika, index) => (
          <div key={index} style={{ display: "flex", marginBottom: "10px" }}>
            <input
              type="text"
              value={slika}
              onChange={(e) => promjeniSliku(index, e.target.value)}
              placeholder={`URL slike ${index + 1}...`}
              style={{ flex: 1 }}
            />
            {slike.length > 1 && (
              <button
                type="button"
                onClick={() => ukloniSliku(index)}
                style={{ 
                  marginLeft: "10px", 
                  background: "red", 
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "5px 10px",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={dodajSliku}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "8px 15px",
            cursor: "pointer",
            marginBottom: "15px"
          }}
        >
          + Dodaj još jednu sliku
        </button>

        {/* Gumb za spremanje */}
        <button type="submit" disabled={loading}>
          {id ? "Spremi promjene" : "Spremi recept"}
        </button>
      </form>

      {/* Prikaz poruka o greškama */}
      {poruka && !poruka.startsWith("✅") && (
        <p
          className="poruka"
          style={{
            color: "red",
            marginTop: "1rem",
          }}
        >
          {poruka}
        </p>
      )}
    </div>
  );
}

export default DodajRecept;