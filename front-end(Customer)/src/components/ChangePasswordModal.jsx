import React, { useState } from "react";
import axios from "axios";
import "./ChangePasswordModal.scss";

const ChangePasswordModal = ({ show, onClose, username }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        "https://localhost:7050/api/TaiKhoan/changepassword",
        {
          userName: username,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }
      );

      setSuccess("Đổi mật khẩu thành công!");
      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // Đóng modal sau 2 giây
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.response?.data || "Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Đổi mật khẩu</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            disabled={loading}
          ></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}
            <div className="mb-3">
              <label className="form-label">Mật khẩu hiện tại</label>
              <input
                type="password"
                className="form-control"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
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
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
