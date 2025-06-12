import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Header.scss";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Nếu không ở trang chủ, chuyển về trang chủ và scroll
      window.location.href = `/#${sectionId}`;
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="header fixed-top">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            TourDuLich
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="navbar-nav ms-auto d-flex align-items-center gap-3">
              <button
                className="nav-link btn btn-link"
                onClick={() => scrollToSection("home")}
              >
                Home
              </button>
              <button
                className="nav-link btn btn-link"
                onClick={() => scrollToSection("about")}
              >
                About
              </button>
              <button
                className="nav-link btn btn-link"
                onClick={() => scrollToSection("contact")}
              >
                Contact
              </button>
              <Link to="/tours" className="nav-link btn btn-link">
                Tour
              </Link>
              {isAuthenticated ? (
                <>
                  <div className="dropdown">
                    <button
                      className="btn btn-link nav-link dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="bi bi-person-circle me-1"></i>
                      {user?.username}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          Thông tin cá nhân
                        </Link>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                        >
                          {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-primary">
                    Đăng Nhập
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Đăng Ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
