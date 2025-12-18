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
  const [userReaction, setUserReaction] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  const { currentUser, userData } = useAuth();

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

        if (currentUser) {
          const userReactionRef = doc(db, "users", currentUser.uid, "reactions", id);
          const userReactionSnap = await getDoc(userReactionRef);
          
          if (userReactionSnap.exists()) {
            setUserReaction(userReactionSnap.data().type);
          } else {
            setUserReaction(null);
          }
        }

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

  const sveSlike = recept?.slike && recept.slike.length > 0 
    ? recept.slike 
    : recept?.slika 
      ? [recept.slika] 
      : [];

  const toggleZoom = (imageUrl) => {
    setZoomedImage(zoomedImage === imageUrl ? null : imageUrl);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (zoomedImage && !e.target.closest('.slika-wrapper')) {
        setZoomedImage(null);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape' && zoomedImage) {
        setZoomedImage(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [zoomedImage]);

  const handleReaction = async (reactionType) => {
    if (!currentUser || !recept || updating) return;
    
    setUpdating(true);
    try {
      const userReactionRef = doc(db, "users", currentUser.uid, "reactions", id);
      const receptRef = doc(db, "recepti", id);

      const oppositeReaction = reactionType === 'like' ? 'dislike' : 'like';
      const currentArray = reactionType === 'like' ? 'likes' : 'dislikes';
      const oppositeArray = reactionType === 'like' ? 'dislikes' : 'likes';

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
        await setDoc(userReactionRef, {
          type: reactionType,
          createdAt: new Date()
        });

        const updates = {
          [currentArray]: arrayUnion(currentUser.uid)
        };

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
    if (!currentUser || !noviKomentar.trim() || updating) return;
    
    setUpdating(true);
    try {
      const komentarRef = await addDoc(collection(db, "komentari"), {
        tekst: noviKomentar.trim(),
        userId: currentUser.uid,
        username: userData?.username || currentUser.displayName || "Anoniman",
        receptId: id,
        createdAt: new Date()
      });
      
      const receptRef = doc(db, "recepti", id);
      await updateDoc(receptRef, {
        komentari: arrayUnion(komentarRef.id)
      });
      
      const noviKomentarObj = {
        id: komentarRef.id,
        tekst: noviKomentar.trim(),
        username: userData?.username || currentUser.displayName || "Anoniman",
        userId: currentUser.uid
      };
      
      setKomentari(prev => [...prev, noviKomentarObj]);
      setNoviKomentar("");
      
    } catch (error) {
      console.error("Greška pri dodavanju komentara:", error);
      alert("Greška pri dodavanju komentara.");
    } finally {
      setUpdating(false);
    }
  };

  const handleBrisiKomentar = async (komentarId) => {
    if (!currentUser || updating) return;
    
    const komentarZaBrisanje = komentari.find(k => k.id === komentarId);
    const jeAdmin = userData?.role === "admin";
    const jeVlasnik = komentarZaBrisanje?.userId === currentUser.uid;
    
    if (!jeAdmin && !jeVlasnik) {
      alert("Nemate ovlasti za brisanje ovog komentara.");
      return;
    }
    
    if (!window.confirm("Jeste li sigurni da želite obrisati ovaj komentar?")) return;
    
    setUpdating(true);
    try {
      await deleteDoc(doc(db, "komentari", komentarId));
      
      const receptRef = doc(db, "recepti", id);
      await updateDoc(receptRef, {
        komentari: arrayRemove(komentarId)
      });
      
      setKomentari(prev => prev.filter(k => k.id !== komentarId));
      
    } catch (error) {
      console.error("Greška pri brisanju komentara:", error);
      alert("Greška pri brisanju komentara.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Učitavanje...</p>;
  if (!recept) return <p>Recept nije pronađen.</p>;

  return (
    <div className="recept-page-wrapper">
      <div className="recept-layout">
        {/* GLAVNI SADRŽAJ - LIJEVA STRANA */}
        <div className="detalji-recepta">
          <h2>{recept.naziv}</h2>
          
          <div className="recept-metadata">
            <div className="metadata-item">
              <span className="icon">🍳</span>
              <strong>Kuhinja:</strong> {recept.kuhinja || "Nepoznato"}
            </div>
            <div className="metadata-item">
              <span className="icon">⏱️</span>
              <strong>Vrijeme:</strong> {recept.vrijemePripreme || "N/A"}
            </div>
            <div className="metadata-item">
              <span className="icon">🏷️</span>
              <strong>Tagovi:</strong> {recept.tagovi?.join(", ") || "Nema"}
            </div>
           
          </div>

          {sveSlike.length > 0 && (
            <div className="slike-container">
              <h3>Slike</h3>
              <div className="slike-grid">
                {sveSlike.map((slika, index) => (
                  <div 
                    key={index}
                    className={`slika-wrapper ${zoomedImage === slika ? 'zoomed' : ''}`}
                    onClick={() => toggleZoom(slika)}
                  >
                    <img 
                      src={slika} 
                      alt={`${recept.naziv} ${index + 1}`} 
                      className="slika-recepta"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="recept-content">
            <div className="recept-ingredients">
              <h3>📋 Sastojci</h3>
              <ul>
                {recept.sastojci.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="recept-preparation">
              <h3>👨‍🍳 Priprema</h3>
              <div className="preparation-text">
                {recept.priprema.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="reaction-container">
            {currentUser ? (
              <>
                <button
                  onClick={handleLike}
                  className={`like-btn ${userReaction === 'like' ? 'liked' : 'not-liked'} ${updating ? 'disabled' : ''}`}
                  disabled={updating}
                  aria-label="Lajk"
                >
                  👍 {recept.likes.length}
                </button>

                <button
                  onClick={handleDislike}
                  className={`dislike-btn ${userReaction === 'dislike' ? 'disliked' : 'not-disliked'} ${updating ? 'disabled' : ''}`}
                  disabled={updating}
                  aria-label="Dislajk"
                >
                  👎 {recept.dislikes.length}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => alert("Prijavi se da možeš lajkat recept.")}>
                  👍 {recept.likes.length}
                </button>
                <button onClick={() => alert("Prijavi se da možeš dislajkat recept.")}>
                  👎 {recept.dislikes.length}
                </button>
              </>
            )}
          </div>

          <div className="komentari-section">
            <h3>💬 Komentari</h3>
            {komentari.length === 0 && <p className="no-comments">Nema komentara. Budi prvi koji će komentirati!</p>}
            <ul className="komentari-lista">
              {komentari.map((k) => (
                <li key={k.id} className="komentar-item">
                  <div className="komentar-header">
                    <strong>{k.username}</strong>
                    <span className="komentar-datum">
                      {k.createdAt?.toDate?.().toLocaleDateString('hr-HR') || 'Danas'}
                    </span>
                  </div>
                  <p className="komentar-tekst">{k.tekst}</p>
                  {(userData?.role === "admin" || k.userId === currentUser?.uid) && (
                    <button
                      onClick={() => handleBrisiKomentar(k.id)}
                      disabled={updating}
                      className="brisi-komentar-btn"
                    >
                      Obriši
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {currentUser ? (
              <div className="komentar-forma">
                <textarea
                  value={noviKomentar}
                  onChange={(e) => setNoviKomentar(e.target.value)}
                  rows={3}
                  placeholder="Napiši komentar..."
                  className="komentar-textarea"
                  disabled={updating}
                />
                <button
                  onClick={handleDodajKomentar}
                  disabled={updating || noviKomentar.trim() === ""}
                  className="komentar-submit"
                >
                  Pošalji komentar
                </button>
              </div>
            ) : (
              <p className="login-prompt">Prijavi se da možeš pisati komentare.</p>
            )}
          </div>
        </div>

        {/* SIDEBAR - DESNA STRANA */}
        <div className="recept-sidebar">

                {/* NUTRITIVNE VRIJEDNOSTI */}
          <div className="sidebar-section">
            <h4>📊 Nutritivne vrijednosti</h4>
            <p className="no-nutrition">
              Za detaljne nutritivne vrijednosti posjetite{' '}
              <a
                href="https://kalorije.info/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kalorije.info
              </a>
            </p>
          </div>

                    {/* SAVJETI ZA PRIPREMU */}
            <div className="sidebar-section">
              <h4>🥄 Savjeti za pripremu</h4>
              <ul className="tips-list">
                <li>
                  <span className="tip-icon">📏</span>
                  <span className="tip-text">
                    Pažljivo pripremite i izmjerite sastojke prije početka kuhanja
                  </span>
                </li>

                <li>
                  <span className="tip-icon">🔥</span>
                  <span className="tip-text">
                    Pratite temperaturu kako biste izbjegli prekuhavanje ili zagorijevanje
                  </span>
                </li>

                <li>
                  <span className="tip-icon">🧂</span>
                  <span className="tip-text">
                    Začine dodajte postupno i prilagođavajte okusu
                  </span>
                </li>

                <li>
                  <span className="tip-icon">⏱️</span>
                  <span className="tip-text">
                    Pridržavajte se vremena pripreme, ali prilagodite prema vlastitom iskustvu
                  </span>
                </li>

                <li>
                  <span className="tip-icon">🍽️</span>
                  <span className="tip-text">
                    Ostavite jelo nekoliko minuta da odmori prije posluživanja
                  </span>
                </li>
              </ul>
            </div>


          {/* DIJELJENJE RECEPTA */}
          <div className="sidebar-section">
            <h4>🔗 Podijeli recept</h4>
            <div className="share-buttons">
              <button 
                className="share-btn facebook"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
              >
                Facebook
              </button>
              <button 
                className="share-btn whatsapp"
                onClick={() => window.open(`https://wa.me/?text=Pogledaj ovaj recept: ${recept.naziv} - ${window.location.href}`, '_blank')}
              >
                WhatsApp
              </button>
              <button 
                className="share-btn copy"
                onClick={() => {
                  navigator.clipboard.writeText(`${recept.naziv} - ${window.location.href}`);
                  alert('Link kopiran!');
                }}
              >
                Kopiraj link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetaljiRecepta;