// BackButton.js u /src/komponente/
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BackButton.css";

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Ne prikazuj na početnoj stranici
  if (location.pathname === "/") return null;

  const handleGoBack = () => {
    navigate(-1); // -1 = jedna stranica unatrag
  };

  return (
    <button 
      onClick={handleGoBack} 
      className="back-button"
      aria-label="Natrag"
      title="Povratak na prethodnu stranicu"
    >
      ←
    </button>
  );
}

export default BackButton;