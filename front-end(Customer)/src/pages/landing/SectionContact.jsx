import React from "react";
import "./SectionContact.scss";
import img from "./image3.png";
import { useNavigate } from "react-router-dom";

const SectionContact = () => {
  const navigate = useNavigate();
  return (
    <section id="contact" className="contact-section py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <h2 className="display-5 fw-bold mb-4">Liên Hệ</h2>
            <p className="lead mb-4">
              Hãy liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
            </p>
            <form className="contact-form">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg hover-focus"
                  placeholder="Họ và tên"
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control form-control-lg hover-focus"
                  placeholder="Email"
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control form-control-lg hover-focus"
                  rows="4"
                  placeholder="Nội dung tin nhắn"
                ></textarea>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-lg hover-lift"
                onClick={() => {
                  alert("Tin nhắn đã được gửi!");
                  window.location.reload();
                }}
              >
                Gửi Tin Nhắn
              </button>
            </form>
          </div>
          <div className="col-lg-6">
            <div className="image-container">
              <img
                src={img}
                alt="Liên hệ"
                className="img-fluid rounded shadow-lg hover-zoom"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionContact;
