import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "../landing/Header";
import Footer from "../landing/Footer";
import "./ToursPage.scss";
import TourScheduleModal from "../../components/TourScheduleModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ToursPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [tours, setTours] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // State cho popup lịch trình
  const [showLichTrinh, setShowLichTrinh] = useState(false);
  const [lichTrinhInput, setLichTrinhInput] = useState({
    tourId: "",
    tourName: "",
    tourSoLuong: 0,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch địa điểm
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("https://localhost:7050/api/DiaDiem");
        setLocations(response.data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchLocations();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://localhost:7050/api/Tour?search=${encodeURIComponent(
          debouncedSearchTerm
        )}&location=${selectedLocation}&sortBy=${sortBy}&sortOrder=${sortOrder}&pageNumber=${currentPage}&pageSize=${pageSize}`
      );
      setTours(response.data.data);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách tour. Vui lòng thử lại sau.");
      console.error("Error fetching tours:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tours với các tham số
  useEffect(() => {
    fetchTours();
  }, [debouncedSearchTerm, selectedLocation, sortBy, sortOrder, currentPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDatTour = (id, name, sl) => {
    if (!isAuthenticated) {
      navigate("/login");
    }
    setShowLichTrinh(!showLichTrinh);
    setLichTrinhInput({
      tourId: id,
      tourName: name,
      tourSoLuong: sl,
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      );
    }

    return (
      <div className="container mt-5">
        <div className="row">
          {/* Danh sách địa điểm - chiếm 4 cột */}
          <div className="col-lg-4">
            <div className="locations-sidebar">
              <h2 className="mb-4">Địa Điểm Du Lịch</h2>
              <div className="list-group">
                <div
                  className={`list-group-item location-card ${
                    selectedLocation === "" ? "active" : ""
                  }`}
                  onClick={() =>
                    handleLocationChange({ target: { value: "" } })
                  }
                  role="button"
                >
                  <h5 className="mb-1">
                    <i className="bi bi-globe me-2"></i>
                    Tất cả địa điểm
                  </h5>
                  <p className="mb-1 text-muted">Xem tất cả tour du lịch</p>
                </div>
                {locations.map((location) => (
                  <div
                    key={location.maDiaDiem}
                    className={`list-group-item location-card ${
                      selectedLocation === location.maDiaDiem ? "active" : ""
                    }`}
                    onClick={() =>
                      handleLocationChange({
                        target: { value: location.maDiaDiem },
                      })
                    }
                    role="button"
                  >
                    <h5 className="mb-1">{location.tenDiaDiem}</h5>
                    <p className="mb-1 text-muted">
                      <i className="bi bi-geo-alt me-2"></i>
                      {location.diaChi}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Danh sách tour - chiếm 8 cột */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Danh Sách Tour Du Lịch</h2>
              <div className="d-flex gap-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm tour..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <select
                  className="form-select"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                >
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {tours.length === 0 ? (
              <div className="text-center py-5">
                <div className="no-tours-found">
                  <i className="fas fa-search fa-3x mb-3 text-muted"></i>
                  <h4 className="mb-3">Không tìm thấy tour nào</h4>
                  <p className="text-muted">
                    {searchTerm || selectedLocation ? (
                      <>
                        Không có tour nào phù hợp với tiêu chí tìm kiếm của bạn.
                        <br />
                        Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc.
                      </>
                    ) : (
                      "Hiện tại chưa có tour nào trong hệ thống."
                    )}
                  </p>
                  {(searchTerm || selectedLocation) && (
                    <button
                      className="btn btn-primary mt-3"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedLocation("");
                        setCurrentPage(1);
                      }}
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {tours.map((tour) => (
                  <div key={tour.maTour} className="col">
                    <div className="card h-100 shadow-sm hover-lift">
                      <img
                        src={tour.hinhAnh}
                        className="card-img-top"
                        alt={tour.tenTour}
                        style={{ height: "160px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{tour.tenTour}</h5>
                        <p className="card-text">
                          <strong>Số lượng:</strong> {tour.soLuong} người
                        </p>
                        <p className="card-text">
                          <strong>Giá:</strong> {formatPrice(tour.giaTour)}
                        </p>
                        <button
                          className="btn btn-primary w-100"
                          onClick={() =>
                            handleDatTour(
                              tour.maTour,
                              tour.tenTour,
                              tour.soLuong
                            )
                          }
                        >
                          Đặt Tour
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Phân trang */}
            {totalPages > 1 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li
                      key={index + 1}
                      className={`page-item ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <Header />
      <main className="main-content">{renderContent()}</main>
      <Footer />
      {showLichTrinh && (
        <TourScheduleModal
          show={showLichTrinh}
          onClose={() => setShowLichTrinh(!showLichTrinh)}
          tourId={lichTrinhInput.tourId}
          tourName={lichTrinhInput.tourName}
          tourSoLuong={lichTrinhInput.tourSoLuong}
          onBookingSuccess={fetchTours}
        />
      )}
    </div>
  );
};

export default ToursPage;
