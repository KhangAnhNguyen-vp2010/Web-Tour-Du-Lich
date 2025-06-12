import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCustomer } from "../../hooks/useCustomer";
import CustomerInfoModal from "../../components/CustomerInfoModal";
import "./Auth.scss";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, showCustomerModal, setShowCustomerModal } = useAuth();
  const {
    addCustomer,
    error: customerError,
    isLoading: customerLoading,
  } = useCustomer();

  useEffect(() => {
    console.log("Current showCustomerModal state:", showCustomerModal);
  }, [showCustomerModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { success, needCustomerInfo } = await login(username, password);
      if (success) {
        if (!needCustomerInfo) {
          navigate("/");
        }
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không đúng");
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
      setShowCustomerModal(false);
      navigate("/");
    } else {
      setError(customerError);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="text-center mb-4">Đăng Nhập</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
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
            {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
          <p className="text-center mb-0">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-primary text-decoration-none">
              Đăng Ký
            </Link>
          </p>
        </form>
      </div>

      {showCustomerModal && (
        <CustomerInfoModal
          show={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onSubmit={handleCustomerInfoSubmit}
          isLoading={customerLoading}
        />
      )}
    </div>
  );
};

export default Login;
