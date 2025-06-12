import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./SectionHome.scss";
import img from "./image1.png";

const SectionHome = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate("/tours");
  };

  return (
    <section id="home" className="home-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="display-4 fw-bold mb-4">Khám Phá Việt Nam</h1>
            <p className="lead mb-4">
              Hành trình khám phá vẻ đẹp thiên nhiên, văn hóa và ẩm thực độc đáo
              của Việt Nam
            </p>
            <button onClick={handleExplore} className="btn btn-primary btn-lg">
              Khám Phá Ngay
            </button>
          </div>
          <div className="col-lg-6">
            <div className="image-container">
              <img
                src={img}
                alt="Việt Nam"
                className="img-fluid rounded shadow-lg hover-zoom"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionHome;
