import { useState } from "react";

export const useCustomer = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const addCustomer = async (customerData, username) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://localhost:7050/api/KhachHang/add-customer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenKH: customerData.fullName,
            email: customerData.email,
            sdt: customerData.phone,
            diaChi: customerData.address,
            tenTaiKhoan: username,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || "Có lỗi xảy ra khi lưu thông tin khách hàng"
        );
      }

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addCustomer,
    error,
    isLoading,
  };
};
