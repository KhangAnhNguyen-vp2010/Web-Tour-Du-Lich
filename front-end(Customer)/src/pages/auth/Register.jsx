import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomerInfoModal from "../../components/CustomerInfoModal";
import { useCustomer } from "../../hooks/useCustomer";
import "./Auth.scss";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const {
    addCustomer,
    error: customerError,
    isLoading: customerLoading,
  } = useCustomer();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    if (username.length > 20) {
      setError("Tên tài khoản tối đa 20 kí tự!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("https://localhost:7050/api/Auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setShowModal(true);
      } else {
        const data = await response.json();
        setError(data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerInfoSubmit = async (customerData) => {
    const success = await addCustomer(customerData, username);
    if (success) {
      setShowModal(false);
      alert(
        "Đăng ký tài khoản thành công!!! Vui lòng đăng nhập lại để tiếp tục!"
      );
      navigate("/login");
    } else {
      setError(customerError);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="text-center mb-4">Đăng Ký</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Tên tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading || customerLoading}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || customerLoading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 mb-3"
            disabled={isLoading || customerLoading}
          >
            {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
          </button>
          <p className="text-center mb-0">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-primary text-decoration-none">
              Đăng Nhập
            </Link>
          </p>
        </form>
      </div>

      <CustomerInfoModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCustomerInfoSubmit}
        isLoading={customerLoading}
      />
    </div>
  );
};

export default Register;
