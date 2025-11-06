import React from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Back.css";

const Back = ({ to = -1, label = "Back" }) => {
    const navigate = useNavigate();

    return (
        <button 
            className="back-btn"
            onClick={() => navigate(to)}
        >
            <i className="fas fa-arrow-left"></i> {label}
        </button>
    );
};

export default Back;
