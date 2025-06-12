import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../landing/Header";
import Footer from "../landing/Footer";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import PhieuDangKyModal from "../../components/PhieuDangKyModal";
import QRModal from "../../components/QRModal";
import "./ProfilePage.scss";
import img_QR from "./image-QR.png";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    maKh: "",
    tenKh: "",
    diaChi: "",
    email: "",
    sdt: "",
    tentk: "",
  });
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [showPhieuDetail, setShowPhieuDetail] = useState(false);
  const [selectedPhieu, setSelectedPhieu] = useState(null);
  const [paidTours, setPaidTours] = useState([]);
  const [loadingPaidTours, setLoadingPaidTours] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchTourTerm, setSearchTourTerm] = useState("");
  const [searchTourDate, setSearchTourDate] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Lấy thông tin user từ localStorage
        const storedUser = localStorage.getItem("user");
        console.log("Raw storedUser:", storedUser);

        if (!storedUser) {
          throw new Error("Không tìm thấy thông tin người dùng");
        }

        const user = JSON.parse(storedUser);
        console.log("Parsed user object:", user);
        console.log("Username to fetch:", user.username);

        // Lấy thông tin khách hàng dựa vào username
        const response = await axios.get(
          `https://localhost:7050/api/khachhang/${user.username}`
        );
        console.log("API Response:", response);
        console.log("Customer data:", response.data);

        setUserData(response.data);
        setFormData(response.data); // Khởi tạo form data
        if (response.data.maKh) {
          fetchOrders(response.data.maKh);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchOrders = async (maKh) => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      const response = await axios.get(
        `https://localhost:7050/api/HoaDon/khachhang/${maKh}`
      );
      setOrders(response.data);
    } catch (err) {
      setOrdersError(err.response?.data || "Không thể tải danh sách đơn hàng");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Thêm useEffect để kiểm tra và tự động hủy phiếu
  useEffect(() => {
    const checkAndAutoCancelOrders = async () => {
      if (!orders.length) return;

      const now = new Date();

      for (const order of orders) {
        // Chỉ xử lý các đơn chưa thanh toán
        if (order.trangThai === "Chưa thanh toán") {
          const orderDate = new Date(order.ngayLap);
          const secondsDiff = (now - orderDate) / 1000; // Chuyển đổi sang giây
          const hoursDiff = (now - orderDate) / (1000 * 60 * 60);

          // Nếu đã qua một thời hạn nhất định
          // secondsDiff >= 10
          // hoursDiff >= 12
          if (hoursDiff >= 12) {
            try {
              // Gọi API tự động hủy phiếu
              await axios.put(
                `https://localhost:7050/api/PhieuDangKy/TuDongHuy/${order.maPhieu}`
              );

              // Cập nhật trạng thái hóa đơn
              await axios.put(
                `https://localhost:7050/api/HoaDon/capnhat-trangthai/${order.maHd}`,
                { trangThai: "Đã hủy" }
              );

              // Refresh lại danh sách đơn hàng
              if (userData?.maKh) {
                fetchOrders(userData.maKh);
              }
            } catch (error) {
              console.error("Error auto-cancelling order:", error);
            }
          }
        }
      }
    };

    // Chạy kiểm tra mỗi 5 giây
    const interval = setInterval(checkAndAutoCancelOrders, 5000);

    // Chạy kiểm tra ngay khi component mount
    checkAndAutoCancelOrders();

    return () => clearInterval(interval);
  }, [orders, userData?.maKh]);

  const fetchPaidTours = async (maKh) => {
    try {
      setLoadingPaidTours(true);
      const response = await axios.get(
        `https://localhost:7050/api/HoaDon/hoadon-dathanhtoan/${maKh}`
      );
      // Chỉ lấy chi tiết tour từ response
      const tours = response.data.flatMap((hd) =>
        hd.chiTietTours.map((tour) => ({
          ...tour,
          ngayBd: new Date(tour.ngayBd).toLocaleDateString("vi-VN"),
          ngayKt: new Date(tour.ngayKt).toLocaleDateString("vi-VN"),
        }))
      );
      setPaidTours(tours);
    } catch (error) {
      console.error("Error fetching paid tours:", error);
    } finally {
      setLoadingPaidTours(false);
    }
  };

  useEffect(() => {
    if (activeTab === "myTours" && formData.maKh) {
      fetchPaidTours(formData.maKh);
    }
  }, [activeTab, formData.maKh]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateError("");
    setUpdateSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(userData); // Reset form về dữ liệu gốc
    setUpdateError("");
    setUpdateSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess(false);

    try {
      const response = await axios.put(
        `https://localhost:7050/api/khachhang/${formData.maKh}`,
        formData
      );

      if (response.status === 204) {
        setUpdateSuccess(true);
        setIsEditing(false);
        // Cập nhật lại userData với dữ liệu mới
        setUserData(formData);
      }
    } catch (err) {
      console.error("Error updating customer:", err);
      setUpdateError(
        err.response?.data || "Có lỗi xảy ra khi cập nhật thông tin"
      );
    }
  };

  const handlePhieuClick = (phieu) => {
    setSelectedPhieu(phieu);
    setShowPhieuDetail(true);
  };

  const handlePaymentSuccess = (makh) => {
    // Đóng modal chi tiết phiếu đăng ký
    setShowPhieuDetail(false);
    // Reset selected phieu
    setSelectedPhieu(null);
    // Refresh danh sách phiếu đăng ký
    fetchOrders(makh);
  };

  // Thêm hàm lọc hóa đơn
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.maHd.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.maPhieu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate =
      !searchDate ||
      new Date(order.ngayLap).toLocaleDateString() ===
        new Date(searchDate).toLocaleDateString();
    const matchesStatus = !searchStatus || order.trangThai === searchStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  // Thêm hàm lọc tour
  const filteredPaidTours = paidTours.filter((tour) => {
    const matchesSearch =
      tour.tenTour.toLowerCase().includes(searchTourTerm.toLowerCase()) ||
      tour.maTour.toLowerCase().includes(searchTourTerm.toLowerCase());
    const matchesDate =
      !searchTourDate ||
      tour.ngayBd === new Date(searchTourDate).toLocaleDateString("vi-VN");
    return matchesSearch && matchesDate;
  });

  // Debug render
  console.log("Current state:", { userData, loading, error });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Debug render
  console.log("Rendering profile with data:", userData);

  return (
    <div className="profile-page">
      <Header />
      <div className="container py-5">
        <div className="row">
          <div className="col-md-3">
            <div className="profile-sidebar">
              <ul className="list-group list-group-flush">
                <li
                  className={`list-group-item ${
                    activeTab === "info" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("info")}
                >
                  <i className="fas fa-user me-2"></i>
                  Thông tin cá nhân
                </li>
                <li
                  className={`list-group-item ${
                    activeTab === "orders" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("orders")}
                >
                  <i className="fas fa-shopping-bag me-2"></i>
                  Đơn hàng của tôi
                </li>
                <li
                  className={`list-group-item ${
                    activeTab === "myTours" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("myTours")}
                >
                  <i className="fas fa-shopping-bag me-2"></i>
                  Vé Tour của tôi
                </li>
                <li
                  className="list-group-item"
                  onClick={() => setShowChangePassword(true)}
                >
                  <i className="fas fa-key me-2"></i>
                  Đổi mật khẩu
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-9">
            <div className="profile-content">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : (
                <>
                  {activeTab === "info" && (
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="card-title mb-0">Thông tin cá nhân</h5>
                          {!isEditing && (
                            <button
                              className="btn btn-primary"
                              onClick={handleEdit}
                            >
                              <i className="fas fa-edit me-2"></i>
                              Chỉnh sửa
                            </button>
                          )}
                        </div>
                        {updateSuccess && (
                          <div className="alert alert-success mb-4">
                            Cập nhật thông tin thành công!
                          </div>
                        )}
                        {updateError && (
                          <div className="alert alert-danger mb-4">
                            {updateError}
                          </div>
                        )}
                        <form onSubmit={handleSubmit}>
                          <div className="mb-3">
                            <label className="form-label">Mã khách hàng</label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.maKh || ""}
                              disabled
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Tên khách hàng</label>
                            <input
                              type="text"
                              className="form-control"
                              name="tenKh"
                              value={formData.tenKh || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              name="email"
                              value={formData.email || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Số điện thoại</label>
                            <input
                              type="tel"
                              className="form-control"
                              name="sdt"
                              value={formData.sdt || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Địa chỉ</label>
                            <input
                              type="text"
                              className="form-control"
                              name="diaChi"
                              value={formData.diaChi || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Tên tài khoản</label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.tentk || ""}
                              disabled
                            />
                          </div>
                          {isEditing && (
                            <div className="d-flex gap-2">
                              <button type="submit" className="btn btn-primary">
                                Lưu thay đổi
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleCancel}
                              >
                                Hủy
                              </button>
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  )}

                  {activeTab === "orders" && (
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title mb-4">Đơn hàng của tôi</h5>
                        <h5 className="card-title mb-4">
                          {
                            "Các hoá đơn sẽ tự động huỷ sau 12 giờ chưa thanh toán!!! (Ngoại trừ hoá đơn đã thanh toán)"
                          }
                        </h5>
                        {/* Thêm phần tìm kiếm */}
                        <div className="row mb-4">
                          <div className="col-md-4">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Tìm theo mã hóa đơn hoặc mã phiếu..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          <div className="col-md-3">
                            <input
                              type="date"
                              className="form-control"
                              value={searchDate}
                              onChange={(e) => setSearchDate(e.target.value)}
                            />
                          </div>
                          <div className="col-md-3">
                            <select
                              className="form-select"
                              value={searchStatus}
                              onChange={(e) => setSearchStatus(e.target.value)}
                            >
                              <option value="">Tất cả trạng thái</option>
                              <option value="Chưa thanh toán">
                                Chưa thanh toán
                              </option>
                              <option value="Đã thanh toán">
                                Đã thanh toán
                              </option>
                              <option value="Đã hủy">Đã hủy</option>
                            </select>
                          </div>
                          <div className="col-md-2">
                            <button
                              className="btn btn-secondary w-100"
                              onClick={() => {
                                setSearchTerm("");
                                setSearchDate("");
                                setSearchStatus("");
                              }}
                            >
                              Xóa bộ lọc
                            </button>
                          </div>
                        </div>

                        {ordersLoading ? (
                          <div className="text-center py-3">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </div>
                        ) : ordersError ? (
                          <div className="alert alert-danger" role="alert">
                            {ordersError}
                          </div>
                        ) : filteredOrders.length === 0 ? (
                          <div className="text-center py-3">
                            <p className="text-muted">
                              {orders.length === 0
                                ? "Bạn chưa có đơn hàng nào."
                                : "Không tìm thấy đơn hàng phù hợp với bộ lọc."}
                            </p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Mã hóa đơn</th>
                                  <th>Ngày lập</th>
                                  <th>Tổng tiền</th>
                                  <th>Trạng thái</th>
                                  <th>Mã phiếu</th>
                                  <th>Thao tác</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredOrders.map((order) => (
                                  <tr key={order.maHd}>
                                    <td>{order.maHd}</td>
                                    <td>
                                      {new Date(order.ngayLap).toLocaleString(
                                        "vi-VN"
                                      )}
                                    </td>
                                    <td>
                                      {order.tongTien.toLocaleString("vi-VN")}{" "}
                                      VNĐ
                                    </td>
                                    <td>
                                      <span
                                        className={`badge ${
                                          order.trangThai === "Chưa thanh toán"
                                            ? "bg-warning"
                                            : order.trangThai ===
                                              "Đã thanh toán"
                                            ? "bg-success"
                                            : "bg-secondary"
                                        }`}
                                      >
                                        {order.trangThai}
                                      </span>
                                    </td>
                                    <td>{order.maPhieu}</td>
                                    <td>
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handlePhieuClick(order)}
                                      >
                                        <i className="fas fa-eye me-1"></i>
                                        Xem chi tiết
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "myTours" && (
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title mb-4">Vé Tour của tôi</h5>

                        {/* Thêm phần tìm kiếm */}
                        <div className="row mb-4">
                          <div className="col-md-6">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Tìm theo tên tour hoặc mã tour..."
                              value={searchTourTerm}
                              onChange={(e) =>
                                setSearchTourTerm(e.target.value)
                              }
                            />
                          </div>
                          <div className="col-md-4">
                            <input
                              type="date"
                              className="form-control"
                              value={searchTourDate}
                              onChange={(e) =>
                                setSearchTourDate(e.target.value)
                              }
                            />
                          </div>
                          <div className="col-md-2">
                            <button
                              className="btn btn-secondary w-100"
                              onClick={() => {
                                setSearchTourTerm("");
                                setSearchTourDate("");
                              }}
                            >
                              Xóa bộ lọc
                            </button>
                          </div>
                        </div>

                        {loadingPaidTours ? (
                          <div className="text-center py-3">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </div>
                        ) : filteredPaidTours.length === 0 ? (
                          <div className="text-center py-3">
                            <p className="text-muted">
                              {paidTours.length === 0
                                ? "Bạn chưa có vé tour nào."
                                : "Không tìm thấy tour phù hợp với bộ lọc."}
                            </p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Mã Tour</th>
                                  <th>Tên Tour</th>
                                  <th>Ngày bắt đầu</th>
                                  <th>Ngày kết thúc</th>
                                  <th>Scan QR</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredPaidTours.map((tour) => (
                                  <tr key={tour.maTour}>
                                    <td>{tour.maTour}</td>
                                    <td>{tour.tenTour}</td>
                                    <td>{tour.ngayBd}</td>
                                    <td>{tour.ngayKt}</td>
                                    <td>
                                      <img
                                        src={img_QR}
                                        alt="QR"
                                        width={50}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setShowQRModal(true)}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ChangePasswordModal
        show={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        username={userData?.username}
      />
      <PhieuDangKyModal
        show={showPhieuDetail}
        onClose={() => setShowPhieuDetail(false)}
        maPhieu={selectedPhieu?.maPhieu}
        onPaymentSuccess={(makh) => handlePaymentSuccess(formData.maKh)}
        price={selectedPhieu?.tongTien}
        maHd={selectedPhieu?.maHd}
        trangThai={selectedPhieu?.trangThai}
      />
      <QRModal
        show={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrImage={img_QR}
      />
    </div>
  );
};

export default ProfilePage;
