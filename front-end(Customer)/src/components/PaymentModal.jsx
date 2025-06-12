import React, { useState } from "react";
import axios from "axios";
import "./PaymentModal.scss";
import MMB from "./MBB.png";
import TCB from "./TCB.png";
import VCB from "./VCB.png";

const PaymentModal = ({
  show,
  onClose,
  onPaymentSuccess,
  totalAmount,
  maHd,
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const paymentMethods = [
    {
      id: "vietcombank",
      name: "Vietcombank",
      logo: VCB,
    },
    {
      id: "techcombank",
      name: "Techcombank",
      logo: TCB,
    },
    {
      id: "mbbank",
      name: "MB Bank",
      logo: MMB,
    },
    {
      id: "visa",
      name: "Visa",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png",
    },
    {
      id: "mastercard",
      name: "Mastercard",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png",
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError("Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Gọi API cập nhật trạng thái hóa đơn
      const response = await axios.put(
        `https://localhost:7050/api/HoaDon/capnhat-trangthai/${maHd}`,
        {
          trangThai: "Đã thanh toán",
        }
      );

      if (response.status === 200) {
        // Đóng modal thanh toán
        onClose();
        // Gọi callback để load lại danh sách và đóng các popup khác
        onPaymentSuccess();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <div className="payment-info mb-4">
            <h6 className="section-title">Thông tin thanh toán</h6>
            <div className="amount-display">
              <span className="amount-label">Tổng tiền:</span>
              <span className="amount-value">
                {totalAmount.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          </div>

          <div className="payment-methods">
            <h6 className="section-title">Chọn phương thức thanh toán</h6>
            <div className="methods-grid">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`method-item ${
                    selectedMethod === method.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <img
                    src={method.logo}
                    alt={method.name}
                    className="method-logo"
                  />
                  <span className="method-name">{method.name}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePayment}
            disabled={loading || !selectedMethod}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Đang xử lý...
              </>
            ) : (
              "Thanh toán"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
