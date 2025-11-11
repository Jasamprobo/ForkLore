import React from "react";
import './komponente/global.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./komponente/AuthContext";

import Recepti from "./stranice/Recepti";
import DodajRecept from "./stranice/DodajRecept";
import DetaljiRecepta from "./stranice/DetaljiRecepta";
import Register from "./stranice/Register";
import Login from "./stranice/Login";
import AdminEdit from "./stranice/AdminEdit";
import Pocetna from "./stranice/Pocetna";
import Footer from "./komponente/Footer";
import Navigation from "./komponente/Navigation"; // ← PREMIJESTI NAVIGATION U POSEBNI FILE

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation /> {/* ← SADA JE ISPRAVNO POZVAN */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Pocetna />} />
              <Route path="/recepti" element={<Recepti />} />
              <Route path="/dodaj" element={<DodajRecept />} />
              <Route path="/recept/:id" element={<DetaljiRecepta />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminEdit />} />
              <Route path="/dodaj/:id" element={<DodajRecept />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;