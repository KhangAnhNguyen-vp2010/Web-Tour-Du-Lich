import React, { useState, useEffect } from "react";
import axios from "axios";
import PaymentModal from "./PaymentModal";
import "./PhieuDangKyModal.scss";

const PhieuDangKyModal = ({
  show,
  onClose,
  maPhieu,
  onPaymentSuccess,
  price,
  maHd,
  trangThai,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phieuData, setPhieuData] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  useEffect(() => {
    if (show && maPhieu) {
      fetchPhieuDetail();
      setCancelError(null);
    }
  }, [show, maPhieu]);

  const fetchPhieuDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `https://localhost:7050/api/PhieuDangKy/Chi-Tiet/${maPhieu}`
      );
      setPhieuData(response.data);
    } catch (err) {
      setError(
        err.response?.data ||
          "Không thể tải thông tin phiếu đăng ký. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy phiếu đăng ký này?")) {
      return;
    }

    try {
      setCancelLoading(true);
      setCancelError(null);

      // Hủy phiếu đăng ký
      const response = await axios.put(
        `https://localhost:7050/api/PhieuDangKy/Huy/${maPhieu}`
      );

      // Cập nhật trạng thái hóa đơn
      if (maHd) {
        await axios.put(
          `https://localhost:7050/api/HoaDon/capnhat-trangthai/${maHd}`,
          { trangThai: "Đã hủy" }
        );
      }

      alert(response.data.message);
      onClose();
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err) {
      setCancelError(
        err.response?.data ||
          "Không thể hủy phiếu đăng ký. Vui lòng thử lại sau."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        className="modal-overlay"
        onClick={() => {
          setCancelError(null);
          onClose();
        }}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h5 className="modal-title">Chi tiết phiếu đăng ký</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setCancelError(null);
                onClose();
              }}
            ></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            ) : phieuData ? (
              <div className="phieu-detail">
                <div className="info-section mb-4">
                  <h6 className="section-title">Thông tin chung</h6>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Mã phiếu:</label>
                      <span>{phieuData.maPhieu}</span>
                    </div>
                    <div className="info-item">
                      <label>Mã khách hàng:</label>
                      <span>{phieuData.maKhachHang}</span>
                    </div>
                    <div className="info-item">
                      <label>Tên khách hàng:</label>
                      <span>{phieuData.tenKhachHang}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày đăng ký:</label>
                      <span>
                        {new Date(phieuData.ngayDangKy).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="tours-section">
                  <h6 className="section-title">Chi tiết tour</h6>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Mã tour</th>
                          <th>Tên tour</th>
                          <th>Số lượng đăng ký</th>
                          <th>Ngày bắt đầu</th>
                          <th>Ngày kết thúc</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phieuData.chiTiet.map((tour) => (
                          <tr key={tour.maTour}>
                            <td>{tour.maTour}</td>
                            <td>{tour.tenTour}</td>
                            <td>{tour.soLuongDangKy}</td>
                            <td>
                              {new Date(tour.ngayBD).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td>
                              {new Date(tour.ngayKT).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="payment-section mt-4">
                  <div className="d-grid gap-2">
                    {trangThai !== "Đã thanh toán" &&
                      trangThai !== "Đã hủy" && (
                        <button
                          className="btn btn-primary"
                          onClick={() => setShowPayment(true)}
                          disabled={cancelLoading}
                        >
                          <i className="fas fa-credit-card me-2"></i>
                          Thanh toán
                        </button>
                      )}
                    {trangThai !== "Đã hủy" && (
                      <button
                        className="btn btn-danger"
                        onClick={handleCancel}
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Đang hủy...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-times me-2"></i>
                            Hủy phiếu
                          </>
                        )}
                      </button>
                    )}
                    {trangThai === "Đã hủy" && (
                      <div className="alert alert-danger" role="alert">
                        <i className="fas fa-times-circle me-2"></i>
                        Phiếu đã bị hủy
                      </div>
                    )}
                  </div>
                  {cancelError && (
                    <div className="alert alert-danger mt-3" role="alert">
                      {cancelError}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <PaymentModal
        show={showPayment}
        onClose={() => setShowPayment(false)}
        onPaymentSuccess={handlePaymentSuccess}
        totalAmount={price}
        maHd={maHd}
      />
    </>
  );
};

export default PhieuDangKyModal;
