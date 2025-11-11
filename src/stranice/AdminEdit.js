import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

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
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
      <h2>Admin panel - Upravljanje receptima</h2>
      {recepti.length === 0 ? (
        <p>Nema recepata za prikaz.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Naziv</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Kuhinja</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {recepti.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: "8px" }}>{r.naziv}</td>
                <td style={{ padding: "8px" }}>{r.kuhinja || "Nepoznato"}</td>
                <td style={{ padding: "8px" }}>
                  {/* Promijenjeno: vodi na DodajRecept u modu uređivanja */}
                  <button
                    onClick={() => navigate(`/dodaj/${r.id}`)}
                    style={{ marginRight: "8px" }}
                  >
                    Uredi
                  </button>
                  <button onClick={() => handleDelete(r.id)} style={{ color: "red" }}>
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
