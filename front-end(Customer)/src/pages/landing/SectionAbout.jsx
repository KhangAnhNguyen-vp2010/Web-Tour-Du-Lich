import React from "react";
import "./SectionAbout.scss";
import img from "./image2.png";

const SectionAbout = () => {
  return (
    <section id="about" className="about-section py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <div className="image-container">
              <img
                src={img}
                alt="Về chúng tôi"
                className="img-fluid rounded shadow-lg hover-zoom"
              />
            </div>
          </div>
          <div className="col-lg-6">
            <h2 className="display-5 fw-bold mb-4">Về Chúng Tôi</h2>
            <p className="lead mb-4">
              Chúng tôi là đơn vị lữ hành hàng đầu tại Việt Nam, với hơn 10 năm
              kinh nghiệm trong lĩnh vực du lịch.
            </p>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="feature-card p-4 rounded shadow-sm hover-lift">
                  <h3 className="h5 mb-3">Chuyên Nghiệp</h3>
                  <p className="mb-0">
                    Đội ngũ hướng dẫn viên giàu kinh nghiệm, nhiệt tình
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="feature-card p-4 rounded shadow-sm hover-lift">
                  <h3 className="h5 mb-3">Chất Lượng</h3>
                  <p className="mb-0">Dịch vụ chất lượng cao, giá cả hợp lý</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionAbout;
