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
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../komponente/AuthContext";
import "./DetaljiRecepta.css";

function DetaljiRecepta() {
  const { id } = useParams();
  const [recept, setRecept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [komentari, setKomentari] = useState([]);
  const [noviKomentar, setNoviKomentar] = useState("");
  const [updating, setUpdating] = useState(false);
  const [userReaction, setUserReaction] = useState(null); // 'like', 'dislike' ili null
  const [selectedImage, setSelectedImage] = useState(null);

  const { currentUser, userData } = useAuth();

  // Dohvati recept, komentare i korisnikovu reakciju
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

        // Dohvati korisnikovu reakciju
        if (currentUser) {
          const userReactionRef = doc(db, "users", currentUser.uid, "reactions", id);
          const userReactionSnap = await getDoc(userReactionRef);
          
          if (userReactionSnap.exists()) {
            setUserReaction(userReactionSnap.data().type);
          } else {
            setUserReaction(null);
          }
        }

        // Dohvati komentare
        if (data.komentari && data.komentari.length > 0) {
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
  }, [id, currentUser]);

  // UNIVERZALNA FUNKCIJA ZA REAKCIJE
  const handleReaction = async (reactionType) => {
    if (!currentUser || !recept || updating) return;
    
    setUpdating(true);
    try {
      const userReactionRef = doc(db, "users", currentUser.uid, "reactions", id);
      const receptRef = doc(db, "recepti", id);

      const oppositeReaction = reactionType === 'like' ? 'dislike' : 'like';
      const currentArray = reactionType === 'like' ? 'likes' : 'dislikes';
      const oppositeArray = reactionType === 'like' ? 'dislikes' : 'likes';

      // Ako je već odabrana ista reakcija - ukloni je
      if (userReaction === reactionType) {
        await deleteDoc(userReactionRef);
        await updateDoc(receptRef, {
          [currentArray]: arrayRemove(currentUser.uid)
        });
        setUserReaction(null);
        setRecept(prev => ({
          ...prev,
          [currentArray]: prev[currentArray].filter(uid => uid !== currentUser.uid)
        }));
      } else {
        // Ako je odabrana nova reakcija
        await setDoc(userReactionRef, {
          type: reactionType,
          createdAt: new Date()
        });

        const updates = {
          [currentArray]: arrayUnion(currentUser.uid)
        };

        // Ako je postojaa suprotna reakcija, ukloni je
        if (userReaction === oppositeReaction) {
          updates[oppositeArray] = arrayRemove(currentUser.uid);
        }

        await updateDoc(receptRef, updates);

        setUserReaction(reactionType);
        setRecept(prev => ({
          ...prev,
          [currentArray]: [...prev[currentArray], currentUser.uid],
          [oppositeArray]: userReaction === oppositeReaction 
            ? prev[oppositeArray].filter(uid => uid !== currentUser.uid)
            : prev[oppositeArray]
        }));
      }
    } catch (error) {
      console.error(`Greška pri ${reactionType}:`, error);
      alert(`Greška pri ${reactionType === 'like' ? 'like-anju' : 'dislike-anju'} recepta.`);
    } finally {
      setUpdating(false);
    }
  };

  const handleLike = () => handleReaction('like');
  const handleDislike = () => handleReaction('dislike');

  const handleDodajKomentar = async () => {
  };

  const handleBrisiKomentar = async (komentarId) => {
  };

  if (loading) return <p>Učitavanje...</p>;
  if (!recept) return <p>Recept nije pronađen.</p>;

  return (
    <div className="detalji-recepta">
      <h2>{recept.naziv}</h2>
      <p><strong>Kuhinja:</strong> {recept.kuhinja || "Nepoznato"}</p>
      <p><strong>Vrijeme pripreme:</strong> {recept.vrijemePripreme || "N/A"}</p>
      <p><strong>Tagovi:</strong> {recept.tagovi?.join(", ") || "Nema tagova"}</p>

      {recept.slike && recept.slike.length > 0 ? (
        <div className="slike-container">
          <h3>Slike</h3>
          <div className="slike-grid">
            {recept.slike.map((slika, index) => (
              <img 
                key={index}
                src={slika} 
                alt={`${recept.naziv} ${index + 1}`} 
                className="slika-recepta"
              />
            ))}
          </div>
        </div>
      ) : recept.slika ? (
        <img src={recept.slika} alt={recept.naziv} className="slika-recepta-stara" />
      ) : null}

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

      {/* Lajk / Dislajk - AŽURIRANO */}
      <div style={{ marginTop: "20px" }}>
        {currentUser ? (
          <>
            <button
              onClick={handleLike}
              style={{
                color: userReaction === 'like' ? "green" : "black",
                marginRight: "10px",
                cursor: updating ? "not-allowed" : "pointer",
              }}
              disabled={updating}
              aria-label="Lajk"
            >
              👍 {recept.likes.length}
            </button>

            <button
              onClick={handleDislike}
              style={{
                color: userReaction === 'dislike' ? "red" : "black",
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