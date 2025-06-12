import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra token trong localStorage khi component mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const checkAccount = async (username) => {
    try {
      console.log("Checking account for username:", username);
      const response = await fetch(
        `https://localhost:7050/api/Auth/check-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(username),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Check account response:", data);
        if (!data.daGanKhachHang) {
          console.log("Setting showCustomerModal to true");
          setShowCustomerModal(true);
          return true; // Cần nhập thông tin khách hàng
        }
        return false; // Không cần nhập thông tin
      }
      return false;
    } catch (error) {
      console.error("Error checking account:", error);
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch("https://localhost:7050/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login response:", data);
        setUser(data);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));

        // Kiểm tra tài khoản sau khi đăng nhập thành công
        const needCustomerInfo = await checkAccount(username);
        console.log("Need customer info:", needCustomerInfo);

        return { success: true, needCustomerInfo };
      }
      return { success: false, needCustomerInfo: false };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, needCustomerInfo: false };
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("https://localhost:7050/api/Auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user.username),
      });

      if (response.ok) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    showCustomerModal,
    setShowCustomerModal,
  };
};
