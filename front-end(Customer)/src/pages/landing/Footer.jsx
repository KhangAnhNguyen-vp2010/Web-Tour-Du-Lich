import React from "react";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Về Chúng Tôi</h4>
          <p>
            Du lịch Việt Nam - Nơi mang đến những trải nghiệm du lịch tuyệt vời
            nhất cho bạn. Với hơn 10 năm kinh nghiệm trong lĩnh vực du lịch,
            chúng tôi cam kết mang đến những tour du lịch chất lượng, an toàn và
            đáng nhớ.
          </p>
          <div className="social-links">
            <a href="#" className="social-link">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="social-link">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="social-link">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="social-link">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Liên Kết Nhanh</h4>
          <ul className="footer-links">
            <li>
              <a href="/tours">Tour Du Lịch</a>
            </li>
            <li>
              <a href="/about">Giới Thiệu</a>
            </li>
            <li>
              <a href="/contact">Liên Hệ</a>
            </li>
            <li>
              <a href="/blog">Tin Tức</a>
            </li>
            <li>
              <a href="/faq">FAQ</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Điểm Đến Phổ Biến</h4>
          <ul className="footer-links">
            <li>
              <a href="/tours?destination=dalat">Đà Lạt</a>
            </li>
            <li>
              <a href="/tours?destination=phuquoc">Phú Quốc</a>
            </li>
            <li>
              <a href="/tours?destination=halong">Hạ Long</a>
            </li>
            <li>
              <a href="/tours?destination=sapa">Sapa</a>
            </li>
            <li>
              <a href="/tours?destination=hoian">Hội An</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên Hệ</h4>
          <ul className="contact-info">
            <li>
              <i className="fas fa-map-marker-alt"></i>
              123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
            </li>
            <li>
              <i className="fas fa-phone"></i>
              +84 123 456 789
            </li>
            <li>
              <i className="fas fa-envelope"></i>
              info@dulichvietnam.com
            </li>
            <li>
              <i className="fas fa-clock"></i>
              Thứ 2 - Chủ Nhật: 8:00 - 20:00
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2024 Du Lịch Việt Nam. Tất cả quyền được bảo lưu.</p>
          <div className="footer-bottom-links">
            <a href="/privacy">Chính sách bảo mật</a>
            <a href="/terms">Điều khoản sử dụng</a>
            <a href="/sitemap">Sơ đồ trang web</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
