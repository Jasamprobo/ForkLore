import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; 
import "./DodajRecept.css";

function DodajRecept() {
  const { id } = useParams(); // id recepta ako uređujemo
  const [naziv, postaviNaziv] = useState("");
  const [opis, postaviOpis] = useState("");
  const [sastojci, postaviSastojke] = useState("");
  const [priprema, postaviPripremu] = useState("");
  const [vrijemePripreme, postaviVrijeme] = useState("");
  const [tagovi, postaviTagove] = useState("");
  const [kuhinja, postaviKuhinju] = useState("");
  const [slike, postaviSlike] = useState([""]); 
  const [slika, postaviSliku] = useState("");
  const [poruka, postaviPoruku] = useState("");
  const [loading, postaviLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const navigate = useNavigate();

  // Provjera prijavljenog korisnika
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (korisnik) => {
      setUser(korisnik);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

// Ako uređujemo, učitaj recept
useEffect(() => {
  if (id) {
    postaviLoading(true);
    const docRef = doc(db, "recepti", id);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          postaviNaziv(data.naziv || "");
          postaviOpis(data.opis || "");
          postaviSastojke((data.sastojci || []).join(", "));
          postaviPripremu(data.priprema || "");
          postaviVrijeme(data.vrijemePripreme || "");
          postaviTagove((data.tagovi || []).join(", "));
          postaviKuhinju(data.kuhinja || "");
          
         
          if (data.slike && data.slike.length > 0) {
            postaviSlike(data.slike);
          } else if (data.slika) {

            // Kompatibilnost sa starim receptima koji imaju jednu sliku
            postaviSlike([data.slika]);
          } else {
            postaviSlike([""]);
          }
          
          postaviSliku(data.slika || "");
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

const dodajSliku = () => {
  postaviSlike([...slike, ""]);
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

  const spremiRecept = async (e) => {
    e.preventDefault();

    if (!naziv || !opis || !sastojci || !priprema) {
      postaviPoruku("⚠️ Ispuni sva obavezna polja!");
      return;
    }

    postaviLoading(true);
    postaviPoruku("");

    try {
      const filtriraneSlike = slike.filter(url => url.trim() !== "");
      const receptPodaci = {
    naziv,
    opis,
    sastojci: sastojci.split(",").map((s) => s.trim()),
    priprema,
    vrijemePripreme,
    tagovi: tagovi.split(",").map((t) => t.trim()),
    kuhinja,
    slike: filtriraneSlike,
    slika: filtriraneSlike.length > 0 ? filtriraneSlike[0] : ""
};

      if (id) {
        const docRef = doc(db, "recepti", id);
        await updateDoc(docRef, receptPodaci);
        navigate("/recepti", { state: { successMessage: "✅ Promjene su uspješno spremljene!" } });
      } else {
        await addDoc(collection(db, "recepti"), receptPodaci);
        navigate("/recepti", { state: { successMessage: "✅ Recept uspješno dodan!" } });
      }
    } catch (error) {
      console.error("Greška:", error);
      postaviPoruku("❌ Došlo je do pogreške pri spremanju.");
    } finally {
      postaviLoading(false);
    }
  };

  if (checkingAuth || loading) {
    return <p>Učitavanje...</p>;
  }

  // Ako korisnik nije prijavljen, prikaži obavijest i gumbove za prijavu/registraciju
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

  // Ako je korisnik prijavljen, prikazi formu
  return (
    <div className="forma-container">
      <h2>{id ? "Uredi recept" : "Dodaj novi recept"} 🍲</h2>

      <form onSubmit={spremiRecept} className="forma-recept">
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

<button type="submit" disabled={loading}>
  {id ? "Spremi promjene" : "Spremi recept"}
</button>
      </form>

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
