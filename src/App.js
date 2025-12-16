import React from "react";
import './komponente/global.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./komponente/AuthContext";

// Import svih stranica komponenti
import Recepti from "./stranice/Recepti";
import DodajRecept from "./stranice/DodajRecept";
import DetaljiRecepta from "./stranice/DetaljiRecepta";
import Register from "./stranice/Register";
import Login from "./stranice/Login";
import AdminEdit from "./stranice/AdminEdit";
import Pocetna from "./stranice/Pocetna";
import Footer from "./komponente/Footer";
import Navigation from "./komponente/Navigation"; 

function App() {
  return (
    // AuthProvider omotava cijelu app kako bi sve komponente imale pristup autentifikaciji
    <AuthProvider>
      {/* Router omogućuje navigaciju između stranica */}
      <Router>
        <div className="App">
          <Navigation /> {/* Navigacijska traka koja se prikazuje na svim stranicama */}
          
          <main className="main-content">
            {/* Routes definira sve putanje (rute) u aplikaciji */}
            <Routes>
              {/* Početna stranica */}
              <Route path="/" element={<Pocetna />} />
              
              {/* Stranica sa svim receptima */}
              <Route path="/recepti" element={<Recepti />} />
              
              {/* Stranica za dodavanje novog recepta */}
              <Route path="/dodaj" element={<DodajRecept />} />
              
              {/* Stranica s detaljima pojedinog recepta (/:id je parametar) */}
              <Route path="/recept/:id" element={<DetaljiRecepta />} />
              
              {/* Stranice za registraciju i prijavu */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              
              {/* Administratorska stranica za uređivanje */}
              <Route path="/admin" element={<AdminEdit />} />
              
              {/* Stranica za uređivanje postojećeg recepta (isti komponent kao za dodavanje) */}
              <Route path="/dodaj/:id" element={<DodajRecept />} />
            </Routes>
          </main>
          
          <Footer /> {/* Podnožje koje se prikazuje na svim stranicama */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;