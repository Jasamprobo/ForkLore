import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import "../komponente/AdminEdit.css";  

function AdminEdit() {
  const [recepti, setRecepte] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRecepte() {
      try {
        const querySnapshot = await getDocs(collection(db, "recepti"));
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setRecepte(lista);
      } catch (error) {
        console.error("Greška pri dohvaćanju recepata:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecepte();
  }, []);

  async function handleDelete(id) {
    if (window.confirm("Jeste li sigurni da želite obrisati ovaj recept?")) {
      try {
        await deleteDoc(doc(db, "recepti", id));
        setRecepte((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Greška pri brisanju recepta:", error);
      }
    }
  }

  if (loading) {
    return <p>Učitavanje recepata...</p>;
  }

  return (
    <div className="admin-container">
      <h2>Admin panel - Upravljanje receptima</h2>
      {recepti.length === 0 ? (
        <p>Nema recepata za prikaz.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Naziv</th>
              <th>Kuhinja</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {recepti.map((r) => (
              <tr key={r.id}>
                <td>{r.naziv}</td>
                <td>{r.kuhinja || "Nepoznato"}</td>
                <td className="akcije-cell">
                  <button
                    onClick={() => navigate(`/dodaj/${r.id}`)}
                    className="uredi-gumb"
                  >
                    Uredi
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="obrisi-gumb">
                    Obriši
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminEdit;