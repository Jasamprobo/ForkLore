import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../komponente/AuthContext";

function DetaljiRecepta() {
  const { id } = useParams();
  const [recept, setRecept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [komentari, setKomentari] = useState([]);
  const [noviKomentar, setNoviKomentar] = useState("");
  const [updating, setUpdating] = useState(false);

  const { currentUser, userData } = useAuth();

  // Dohvati recept i komentare
  useEffect(() => {
    const fetchRecept = async () => {
      setLoading(true);
      try {
        const receptRef = doc(db, "recepti", id);
        const receptSnap = await getDoc(receptRef);

        if (!receptSnap.exists()) {
          setRecept(null);
          setKomentari([]);
          return;
        }

        const data = receptSnap.data();

        setRecept({
          ...data,
          likes: data.likes || [],
          dislikes: data.dislikes || [],
          komentari: data.komentari || [],
        });

        if (data.komentari && data.komentari.length > 0) {
          // Dohvati komentare po ID-jevima
          const komentariDocs = await Promise.all(
            data.komentari.map(async (komentarId) => {
              const kDoc = await getDoc(doc(db, "komentari", komentarId));
              return kDoc.exists() ? { id: kDoc.id, ...kDoc.data() } : null;
            })
          );

          setKomentari(komentariDocs.filter((k) => k !== null));
        } else {
          setKomentari([]);
        }
      } catch (error) {
        console.error("Greška pri dohvaćanju recepta:", error);
        setRecept(null);
        setKomentari([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecept();
  }, [id]);

  // Dodaj komentar
  const handleDodajKomentar = async () => {
    if (!currentUser) {
      alert("Moraš biti prijavljen da bi komentirao.");
      return;
    }
    if (noviKomentar.trim() === "") {
      alert("Komentar ne može biti prazan.");
      return;
    }

    setUpdating(true);
    try {
      // Kreiraj novi komentar u kolekciji "komentari"
      const docRef = await addDoc(collection(db, "komentari"), {
        tekst: noviKomentar.trim(),
        userId: currentUser.uid,
        username: currentUser.displayName || currentUser.email || "Anonimac",
        createdAt: new Date(),
      });

      // Dodaj ID komentara u recept
      const receptRef = doc(db, "recepti", id);
      await updateDoc(receptRef, {
        komentari: arrayUnion(docRef.id),
      });

      // Lokalno update komentara i reset textarea
      setKomentari((prev) => [
        ...prev,
        {
          id: docRef.id,
          tekst: noviKomentar.trim(),
          userId: currentUser.uid,
          username: currentUser.displayName || currentUser.email || "Anonimac",
          createdAt: new Date(),
        },
      ]);
      setNoviKomentar("");
    } catch (error) {
      console.error("Greška prilikom dodavanja komentara:", error);
      alert("Greška prilikom dodavanja komentara.");
    } finally {
      setUpdating(false);
    }
  };

  // Briši komentar (samo admin)
  const handleBrisiKomentar = async (komentarId) => {
    if (!currentUser) {
      alert("Niste prijavljeni.");
      return;
    }
    if (userData?.role !== "admin") {
      alert("Nemate ovlasti za brisanje komentara.");
      return;
    }

    setUpdating(true);
    try {
      // Briši komentar iz kolekcije komentari
      await deleteDoc(doc(db, "komentari", komentarId));

      // Ukloni komentar ID iz recepta
      const receptRef = doc(db, "recepti", id);
      await updateDoc(receptRef, {
        komentari: arrayRemove(komentarId),
      });

      // Lokalno ukloni komentar iz liste
      setKomentari((prev) => prev.filter((k) => k.id !== komentarId));
    } catch (error) {
      console.error("Greška pri brisanju komentara:", error);
      alert("Greška pri brisanju komentara.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Učitavanje...</p>;
  if (!recept) return <p>Recept nije pronađen.</p>;

  const userLiked = currentUser && recept.likes.includes(currentUser.uid);
  const userDisliked = currentUser && recept.dislikes.includes(currentUser.uid);

  return (
    <div className="detalji-recepta">
      <h2>{recept.naziv}</h2>
      <p><strong>Kuhinja:</strong> {recept.kuhinja || "Nepoznato"}</p>
      <p><strong>Vrijeme pripreme:</strong> {recept.vrijemePripreme || "N/A"}</p>
      <p><strong>Tagovi:</strong> {recept.tagovi?.join(", ") || "Nema tagova"}</p>

      {recept.slika && (
        <img src={recept.slika} alt={recept.naziv} style={{ maxWidth: "400px", borderRadius: "10px" }} />
      )}

      <h3>Opis</h3>
      <p>{recept.opis}</p>

      {recept.sastojci && (
        <>
          <h3>Sastojci</h3>
          <ul>
            {recept.sastojci.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}

      {recept.priprema && (
        <>
          <h3>Priprema</h3>
          <p>{recept.priprema}</p>
        </>
      )}

      {/* Lajk / Dislajk */}
      <div style={{ marginTop: "20px" }}>
        {currentUser ? (
          <>
            <button
              onClick={() => {
                if (!updating) {
                  // logic for like
                }
              }}
              style={{
                color: userLiked ? "green" : "black",
                marginRight: "10px",
                cursor: updating ? "not-allowed" : "pointer",
              }}
              disabled={updating}
              aria-label="Lajk"
            >
              👍 {recept.likes.length}
            </button>

            <button
              onClick={() => {
                if (!updating) {
                  // logic for dislike
                }
              }}
              style={{
                color: userDisliked ? "red" : "black",
                cursor: updating ? "not-allowed" : "pointer",
              }}
              disabled={updating}
              aria-label="Dislajk"
            >
              👎 {recept.dislikes.length}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => alert("Prijavi se da možeš lajkat ili dislajkat recept.")}
              style={{ marginRight: "10px" }}
            >
              👍 {recept.likes.length}
            </button>
            <button
              onClick={() => alert("Prijavi se da možeš lajkat ili dislajkat recept.")}
            >
              👎 {recept.dislikes.length}
            </button>
          </>
        )}
      </div>

      {/* Komentari */}
      <h3>Komentari</h3>
      {komentari.length === 0 && <p>Nema komentara.</p>}
      <ul>
        {komentari.map((k) => (
          <li key={k.id}>
            <strong>{k.username}:</strong> {k.tekst}
            {userData?.role === "admin" && (
              <button
                onClick={() => handleBrisiKomentar(k.id)}
                disabled={updating}
                style={{ marginLeft: "10px", color: "red" }}
              >
                Obriši
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Dodaj komentar */}
      {currentUser ? (
        <div style={{ marginTop: "10px" }}>
          <textarea
            value={noviKomentar}
            onChange={(e) => setNoviKomentar(e.target.value)}
            rows={3}
            placeholder="Napiši komentar..."
            style={{ width: "100%" }}
            disabled={updating}
          />
          <button
            onClick={handleDodajKomentar}
            disabled={updating || noviKomentar.trim() === ""}
            style={{ marginTop: "5px" }}
          >
            Pošalji komentar
          </button>
        </div>
      ) : (
        <p>Prijavi se da možeš pisati komentare.</p>
      )}
    </div>
  );
}

export default DetaljiRecepta;
