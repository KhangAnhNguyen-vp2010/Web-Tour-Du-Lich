import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TourScheduleModal.scss";

const TourScheduleModal = ({
  show,
  onClose,
  tourId,
  tourName,
  tourSoLuong,
  onBookingSuccess,
}) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    if (show && tourId) {
      fetchSchedules();
    }
  }, [show, tourId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `https://localhost:7050/api/LichTrinh/bytour/${tourId}`
      );
      setSchedules(response.data);
    } catch (err) {
      setError(
        err.response?.data || "Không thể tải lịch trình. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    setQuantity(1); // Reset số lượng khi chọn lịch trình mới
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= tourSoLuong) {
      setQuantity(value);
    }
  };

  const handleBooking = async () => {
    if (!selectedSchedule) {
      setBookingError("Vui lòng chọn lịch trình");
      return;
    }

    if (quantity > tourSoLuong) {
      setBookingError(`Tour chỉ còn ${tourSoLuong} chỗ trống`);
      return;
    }

    if (isBooked) {
      setBookingError("Bạn đã đặt tour này rồi. Vui lòng đợi xử lý hoàn tất.");
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);
      setIsBooked(true);

      // Lấy thông tin khách hàng từ localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setBookingError("Vui lòng đăng nhập để đặt tour");
        setIsBooked(false);
        return;
      }

      const user = JSON.parse(storedUser);
      if (!user.username) {
        setBookingError("Vui lòng đăng nhập để đặt tour");
        setIsBooked(false);
        return;
      }

      // Lấy thông tin khách hàng dựa vào username
      const customerResponse = await axios.get(
        `https://localhost:7050/api/khachhang/${user.username}`
      );

      if (!customerResponse.data || !customerResponse.data.maKh) {
        setBookingError("Không tìm thấy thông tin khách hàng");
        setIsBooked(false);
        return;
      }

      const response = await axios.post(
        "https://localhost:7050/api/PhieuDangKy",
        {
          maKh: customerResponse.data.maKh,
          chiTietTours: [
            {
              maTour: tourId,
              maLT: selectedSchedule.maLt,
              soLuongDk: quantity,
            },
          ],
        }
      );

      // Tạo hóa đơn sau khi tạo phiếu đăng ký thành công
      if (response.data && response.data.maPhieu) {
        try {
          const hoaDonResponse = await axios.post(
            "https://localhost:7050/api/HoaDon/lap-hoa-don",
            {
              maPhieu: response.data.maPhieu,
            }
          );

          if (hoaDonResponse.data) {
            setBookingSuccess(true);

            // Gọi callback để load lại danh sách tour
            if (onBookingSuccess) {
              onBookingSuccess();
            }

            // Đóng modal sau 2 giây
            setTimeout(() => {
              onClose();
              setBookingSuccess(false);
              setSelectedSchedule(null);
              setQuantity(1);
              setIsBooked(false);
            }, 2000);
          }
        } catch (hoaDonError) {
          console.error("Lỗi khi tạo hóa đơn:", hoaDonError);
          setBookingError(
            "Đặt tour thành công nhưng có lỗi khi tạo hóa đơn. Vui lòng liên hệ admin."
          );
          setIsBooked(false);
        }
      }
    } catch (err) {
      setBookingError(
        err.response?.data || "Không thể đặt tour. Vui lòng thử lại sau."
      );
      setIsBooked(false);
    } finally {
      setBookingLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5 className="modal-title">Hãy chọn thời gian bạn muốn đi!!!</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
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
          ) : schedules.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-muted">Chưa có lịch trình cho tour này.</p>
            </div>
          ) : (
            <div className="schedule-list">
              {schedules.map((schedule, index) => (
                <div
                  key={schedule.maLt}
                  className={`schedule-item ${
                    selectedSchedule?.maLt === schedule.maLt ? "selected" : ""
                  }`}
                  onClick={() => handleScheduleSelect(schedule)}
                >
                  <div className="schedule-header">
                    <h6>Lịch trình {index + 1}</h6>
                    <span className="badge bg-primary">
                      {new Date(schedule.ngayBd).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(schedule.ngayKt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="schedule-description">{schedule.moTa}</p>
                </div>
              ))}
            </div>
          )}

          {selectedSchedule && (
            <div className="booking-form mt-4">
              <div className="form-group">
                <label htmlFor="quantity">
                  Số lượng người:{" "}
                  <small className="text-muted">
                    (Còn {tourSoLuong} chỗ trống)
                  </small>
                </label>
                <input
                  type="number"
                  id="quantity"
                  className="form-control"
                  min="1"
                  max={tourSoLuong}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={isBooked}
                />
              </div>
              {bookingError && (
                <div className="alert alert-danger mt-3" role="alert">
                  {bookingError}
                </div>
              )}
              {bookingSuccess && (
                <div className="alert alert-success mt-3" role="alert">
                  Đặt tour thành công!
                </div>
              )}
              <button
                className="btn btn-primary w-100 mt-3"
                onClick={handleBooking}
                disabled={bookingLoading || quantity > tourSoLuong || isBooked}
              >
                {bookingLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang xử lý...
                  </>
                ) : isBooked ? (
                  "Đã đặt tour"
                ) : (
                  "Đặt tour"
                )}
              </button>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourScheduleModal;
