import { useState, useEffect } from "react";
import "./Dashboard.css";
import { tourService } from "../services/tourService";
import { scheduleService } from "../services/scheduleService";
import { locationService } from "../services/locationService";

const Dashboard = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState("tours");
  const [tours, setTours] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    maTour: "",
    tenTour: "",
    soLuong: "",
    giaTour: "",
    hinhAnh: "",
    maLt: "",
    ngayBd: "",
    ngayKt: "",
    moTa: "",
    maDiaDiem: "",
    tenDiaDiem: "",
    diaChi: "",
  });

  const pageSize = 10;

  useEffect(() => {
    if (activeMenu === "tours") {
      fetchTours();
    } else if (activeMenu === "schedules") {
      fetchSchedules();
    } else if (activeMenu === "destinations") {
      fetchLocations();
    }
  }, [activeMenu, searchTerm, sortBy, sortOrder, currentPage]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tourService.getTours(
        searchTerm,
        sortBy,
        sortOrder,
        currentPage,
        pageSize
      );
      setTours(response.data);
      setTotalItems(response.totalItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await scheduleService.getSchedules(
        searchTerm,
        sortBy,
        sortOrder,
        currentPage,
        pageSize
      );
      setSchedules(response.data);
      setTotalItems(response.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await locationService.getLocations(
        searchTerm,
        sortBy || "TenDiaDiem",
        sortOrder === "asc",
        currentPage,
        pageSize
      );
      setLocations(response.items);
      setTotalItems(response.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const getSortClass = (field) => {
    if (sortBy !== field) return "";
    return sortOrder === "asc" ? "sort-asc" : "sort-desc";
  };

  const getSortLabel = (field) => {
    if (sortBy !== field) return "";
    return sortOrder === "asc" ? " (A-Z)" : " (Z-A)";
  };

  const handleAddTour = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await tourService.addTour(formData);
      setShowAddModal(false);
      setFormData({
        maTour: "",
        tenTour: "",
        soLuong: "",
        giaTour: "",
        hinhAnh: "",
      });
      fetchTours();
    } catch (err) {
      console.log(err.message);
      setError(err.message);
      setShowAddModal(true);
    }
  };

  const handleEditTour = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const updateData = {
        tenTour: formData.tenTour,
        soLuong: parseInt(formData.soLuong),
        giaTour: parseInt(formData.giaTour),
        hinhAnh: formData.hinhAnh,
        maDiaDiem: formData.maDiaDiem || null,
      };
      await tourService.updateTour(selectedTour.maTour, updateData);
      setShowEditModal(false);
      setSelectedTour(null);
      setFormData({
        maTour: "",
        tenTour: "",
        soLuong: "",
        giaTour: "",
        hinhAnh: "",
        maDiaDiem: "",
      });
      fetchTours();
    } catch (err) {
      setError(err.message);
      setShowEditModal(true);
    }
  };

  const handleDeleteTour = async (maTour) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tour này?")) {
      try {
        setError(null);
        await tourService.deleteTour(maTour);
        fetchTours();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const openEditModal = (tour) => {
    setSelectedTour(tour);
    setFormData({
      maTour: tour.maTour,
      tenTour: tour.tenTour,
      soLuong: tour.soLuong,
      giaTour: tour.giaTour,
      hinhAnh: tour.hinhAnh,
      maDiaDiem: tour.maDiaDiem || "",
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setFormData({
      maTour: "",
      tenTour: "",
      soLuong: "",
      giaTour: "",
      hinhAnh: "",
    });
    setShowAddModal(true);
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      // Kiểm tra ngày bắt đầu và kết thúc
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const ngayBd = new Date(formData.ngayBd);
      const ngayKt = new Date(formData.ngayKt);

      if (ngayBd < today) {
        setError("Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại");
        return;
      }

      if (ngayKt <= ngayBd) {
        setError("Ngày kết thúc phải lớn hơn ngày bắt đầu");
        return;
      }

      await scheduleService.addSchedule(formData);
      setShowAddModal(false);
      setFormData({
        maTour: "",
        maLt: "",
        ngayBd: "",
        ngayKt: "",
        moTa: "",
      });
      fetchSchedules();
    } catch (err) {
      setError(err.message);
      setShowAddModal(true);
    }
  };

  const handleEditSchedule = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      // Kiểm tra ngày bắt đầu và kết thúc
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const ngayBd = new Date(formData.ngayBd);
      const ngayKt = new Date(formData.ngayKt);

      if (ngayBd < today) {
        setError("Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại");
        return;
      }

      if (ngayKt <= ngayBd) {
        setError("Ngày kết thúc phải lớn hơn ngày bắt đầu");
        return;
      }

      await scheduleService.updateSchedule(selectedSchedule.maLt, formData);
      setShowEditModal(false);
      setSelectedSchedule(null);
      setFormData({
        maTour: "",
        maLt: "",
        ngayBd: "",
        ngayKt: "",
        moTa: "",
      });
      fetchSchedules();
    } catch (err) {
      setError(err.message);
      setShowEditModal(true);
    }
  };

  const handleDeleteSchedule = async (maLt) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch trình này?")) {
      try {
        setError(null);
        await scheduleService.deleteSchedule(maLt);
        fetchSchedules();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const openEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      maTour: schedule.maTour,
      maLt: schedule.maLt,
      ngayBd: schedule.ngayBd,
      ngayKt: schedule.ngayKt,
      moTa: schedule.moTa,
    });
    setShowEditModal(true);
  };

  const openAddSchedule = () => {
    setFormData({
      maTour: "",
      maLt: "",
      ngayBd: "",
      ngayKt: "",
      moTa: "",
    });
    setShowAddModal(true);
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await locationService.addLocation(formData);
      setShowAddModal(false);
      setFormData({
        maDiaDiem: "",
        maTour: "",
        tenDiaDiem: "",
        diaChi: "",
      });
      fetchLocations();
    } catch (err) {
      setError(err.message);
      setShowAddModal(true);
    }
  };

  const handleEditLocation = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await locationService.updateLocation(
        selectedLocation.maDiaDiem,
        formData
      );
      setShowEditModal(false);
      setSelectedLocation(null);
      setFormData({
        maDiaDiem: "",
        maTour: "",
        tenDiaDiem: "",
        diaChi: "",
      });
      fetchLocations();
    } catch (err) {
      setError(err.message);
      setShowEditModal(true);
    }
  };

  const handleDeleteLocation = async (maDiaDiem) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa điểm này?")) {
      try {
        setError(null);
        await locationService.deleteLocation(maDiaDiem);
        fetchLocations();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const openEditLocation = (location) => {
    setSelectedLocation(location);
    setFormData({
      maDiaDiem: location.maDiaDiem,
      maTour: location.maTour,
      tenDiaDiem: location.tenDiaDiem,
      diaChi: location.diaChi,
    });
    setShowEditModal(true);
  };

  const openAddLocation = () => {
    setFormData({
      maDiaDiem: "",
      maTour: "",
      tenDiaDiem: "",
      diaChi: "",
    });
    setShowAddModal(true);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          title="Trang đầu"
        >
          &lt;&lt;
        </button>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          title="Trang trước"
        >
          &lt;
        </button>
        <div className="page-numbers">
          {startPage > 1 && (
            <>
              <span className="page-number" onClick={() => setCurrentPage(1)}>
                1
              </span>
              {startPage > 2 && <span>...</span>}
            </>
          )}
          {pageNumbers.map((number) => (
            <span
              key={number}
              className={`page-number ${
                currentPage === number ? "active" : ""
              }`}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </span>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span>...</span>}
              <span
                className="page-number"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Trang sau"
        >
          &gt;
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage >= totalPages}
          title="Trang cuối"
        >
          &gt;&gt;
        </button>
      </div>
    );
  };

  const renderToursContent = () => (
    <div className="content-section">
      <div className="section-header">
        <h2>Quản lý Tour</h2>
        <button className="add-btn" onClick={openAddModal}>
          Thêm Tour Mới
        </button>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm tour..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <div className="tours-table">
            <table>
              <thead>
                <tr>
                  <th
                    className={getSortClass("maTour")}
                    onClick={() => handleSort("maTour")}
                  >
                    Mã Tour{getSortLabel("maTour")}
                  </th>
                  <th
                    className={getSortClass("tenTour")}
                    onClick={() => handleSort("tenTour")}
                  >
                    Tên Tour{getSortLabel("tenTour")}
                  </th>
                  <th
                    className={getSortClass("soLuong")}
                    onClick={() => handleSort("soLuong")}
                  >
                    Số Lượng{getSortLabel("soLuong")}
                  </th>
                  <th
                    className={getSortClass("giaTour")}
                    onClick={() => handleSort("giaTour")}
                  >
                    Giá Tour{getSortLabel("giaTour")}
                  </th>
                  <th>Mã Địa Điểm</th>
                  <th>Hình Ảnh</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour) => (
                  <tr key={tour.maTour}>
                    <td>{tour.maTour}</td>
                    <td>{tour.tenTour}</td>
                    <td>{tour.soLuong}</td>
                    <td>{tour.giaTour.toLocaleString("vi-VN")} VNĐ</td>
                    <td>{tour.maDiaDiem}</td>
                    <td>
                      <img
                        src={tour.hinhAnh}
                        alt={tour.tenTour}
                        className="tour-image"
                      />
                    </td>
                    <td>
                      <button
                        className="action-btn edit"
                        onClick={() => openEditModal(tour)}
                      >
                        Sửa
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteTour(tour.maTour)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </>
      )}

      {/* Modal thêm tour */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm Tour Mới</h3>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            <form onSubmit={handleAddTour}>
              <div className="form-group">
                <label>Mã Tour:</label>
                <input
                  type="text"
                  value={formData.maTour}
                  onChange={(e) =>
                    setFormData({ ...formData, maTour: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Tên Tour:</label>
                <input
                  type="text"
                  value={formData.tenTour}
                  onChange={(e) =>
                    setFormData({ ...formData, tenTour: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Số Lượng:</label>
                <input
                  type="number"
                  min="1"
                  value={formData.soLuong}
                  onChange={(e) =>
                    setFormData({ ...formData, soLuong: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Giá Tour:</label>
                <input
                  type="number"
                  min="1"
                  value={formData.giaTour}
                  onChange={(e) =>
                    setFormData({ ...formData, giaTour: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Mã Địa Điểm:</label>
                <input
                  type="text"
                  value={formData.maDiaDiem}
                  onChange={(e) =>
                    setFormData({ ...formData, maDiaDiem: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Hình Ảnh:</label>
                <input
                  type="text"
                  value={formData.hinhAnh}
                  onChange={(e) =>
                    setFormData({ ...formData, hinhAnh: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Thêm</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal sửa tour */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sửa Tour</h3>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            <form onSubmit={handleEditTour}>
              <div className="form-group">
                <label>Mã Tour:</label>
                <input type="text" value={formData.maTour} disabled />
              </div>
              <div className="form-group">
                <label>Tên Tour:</label>
                <input
                  type="text"
                  value={formData.tenTour}
                  onChange={(e) =>
                    setFormData({ ...formData, tenTour: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Số Lượng:</label>
                <input
                  type="number"
                  min="1"
                  value={formData.soLuong}
                  onChange={(e) =>
                    setFormData({ ...formData, soLuong: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Giá Tour:</label>
                <input
                  type="number"
                  min="1"
                  value={formData.giaTour}
                  onChange={(e) =>
                    setFormData({ ...formData, giaTour: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Mã Địa Điểm:</label>
                <input
                  type="text"
                  value={formData.maDiaDiem}
                  onChange={(e) =>
                    setFormData({ ...formData, maDiaDiem: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Hình Ảnh:</label>
                <input
                  type="text"
                  value={formData.hinhAnh}
                  onChange={(e) =>
                    setFormData({ ...formData, hinhAnh: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Cập nhật</button>
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderSchedulesContent = () => (
    <div className="content-section">
      <div className="section-header">
        <h2>Quản lý Lịch Trình</h2>
        <button className="add-btn" onClick={openAddSchedule}>
          Thêm Lịch Trình Mới
        </button>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm lịch trình..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <div className="tours-table">
            <table>
              <thead>
                <tr>
                  <th
                    className={getSortClass("maLt")}
                    onClick={() => handleSort("maLt")}
                  >
                    Mã Lịch Trình{getSortLabel("maLt")}
                  </th>
                  <th
                    className={getSortClass("maTour")}
                    onClick={() => handleSort("maTour")}
                  >
                    Mã Tour{getSortLabel("maTour")}
                  </th>
                  <th
                    className={getSortClass("ngayBd")}
                    onClick={() => handleSort("ngayBd")}
                  >
                    Ngày Bắt Đầu{getSortLabel("ngayBd")}
                  </th>
                  <th
                    className={getSortClass("ngayKt")}
                    onClick={() => handleSort("ngayKt")}
                  >
                    Ngày Kết Thúc{getSortLabel("ngayKt")}
                  </th>
                  <th>Mô Tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.maLt}>
                    <td>{schedule.maLt}</td>
                    <td>{schedule.maTour}</td>
                    <td>
                      {new Date(schedule.ngayBd).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      {new Date(schedule.ngayKt).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{schedule.moTa}</td>
                    <td>
                      <button
                        className="action-btn edit"
                        onClick={() => openEditSchedule(schedule)}
                      >
                        Sửa
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteSchedule(schedule.maLt)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </>
      )}

      {/* Modal thêm lịch trình */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm Lịch Trình Mới</h3>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            <form onSubmit={handleAddSchedule}>
              <div className="form-group">
                <label>Mã Lịch Trình:</label>
                <input
                  type="text"
                  value={formData.maLt}
                  onChange={(e) =>
                    setFormData({ ...formData, maLt: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Mã Tour:</label>
                <input
                  type="text"
                  value={formData.maTour}
                  onChange={(e) =>
                    setFormData({ ...formData, maTour: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày Bắt Đầu:</label>
                <input
                  type="date"
                  value={formData.ngayBd}
                  onChange={(e) =>
                    setFormData({ ...formData, ngayBd: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày Kết Thúc:</label>
                <input
                  type="date"
                  value={formData.ngayKt}
                  onChange={(e) =>
                    setFormData({ ...formData, ngayKt: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô Tả:</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) =>
                    setFormData({ ...formData, moTa: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Thêm</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal sửa lịch trình */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sửa Lịch Trình</h3>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            <form onSubmit={handleEditSchedule}>
              <div className="form-group">
                <label>Mã Lịch Trình:</label>
                <input type="text" value={formData.maLt} disabled />
              </div>
              <div className="form-group">
                <label>Mã Tour:</label>
                <input
                  type="text"
                  value={formData.maTour}
                  onChange={(e) =>
                    setFormData({ ...formData, maTour: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày Bắt Đầu:</label>
                <input
                  type="date"
                  value={formData.ngayBd}
                  onChange={(e) =>
                    setFormData({ ...formData, ngayBd: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày Kết Thúc:</label>
                <input
                  type="date"
                  value={formData.ngayKt}
                  onChange={(e) =>
                    setFormData({ ...formData, ngayKt: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô Tả:</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) =>
                    setFormData({ ...formData, moTa: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Cập nhật</button>
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderLocationsContent = () => (
    <div className="content-section">
      <div className="section-header">
        <h2>Quản lý Địa Điểm</h2>
        <button className="add-btn" onClick={openAddLocation}>
          Thêm Địa Điểm Mới
        </button>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm địa điểm..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <div className="tours-table">
            <table>
              <thead>
                <tr>
                  <th
                    className={getSortClass("maDiaDiem")}
                    onClick={() => handleSort("maDiaDiem")}
                  >
                    Mã Địa Điểm{getSortLabel("maDiaDiem")}
                  </th>
                  <th
                    className={getSortClass("tenDiaDiem")}
                    onClick={() => handleSort("tenDiaDiem")}
                  >
                    Tên Địa Điểm{getSortLabel("tenDiaDiem")}
                  </th>
                  <th
                    className={getSortClass("diaChi")}
                    onClick={() => handleSort("diaChi")}
                  >
                    Địa Chỉ{getSortLabel("diaChi")}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.maDiaDiem}>
                    <td>{location.maDiaDiem}</td>
                    <td>{location.tenDiaDiem}</td>
                    <td>{location.diaChi}</td>
                    <td>
                      <button
                        className="action-btn edit"
                        onClick={() => openEditLocation(location)}
                      >
                        Sửa
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteLocation(location.maDiaDiem)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </>
      )}

      {/* Modal thêm địa điểm */}
      {showAddModal && activeMenu === "destinations" && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm Địa Điểm Mới</h3>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            <form onSubmit={handleAddLocation}>
              <div className="form-group">
                <label>Mã Địa Điểm:</label>
                <input
                  type="text"
                  value={formData.maDiaDiem}
                  onChange={(e) =>
                    setFormData({ ...formData, maDiaDiem: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Tên Địa Điểm:</label>
                <input
                  type="text"
                  value={formData.tenDiaDiem}
                  onChange={(e) =>
                    setFormData({ ...formData, tenDiaDiem: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa Chỉ:</label>
                <input
                  type="text"
                  value={formData.diaChi}
                  onChange={(e) =>
                    setFormData({ ...formData, diaChi: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Thêm</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal sửa địa điểm */}
      {showEditModal && activeMenu === "destinations" && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sửa Địa Điểm</h3>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            <form onSubmit={handleEditLocation}>
              <div className="form-group">
                <label>Mã Địa Điểm:</label>
                <input type="text" value={formData.maDiaDiem} disabled />
              </div>
              <div className="form-group">
                <label>Tên Địa Điểm:</label>
                <input
                  type="text"
                  value={formData.tenDiaDiem}
                  onChange={(e) =>
                    setFormData({ ...formData, tenDiaDiem: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa Chỉ:</label>
                <input
                  type="text"
                  value={formData.diaChi}
                  onChange={(e) =>
                    setFormData({ ...formData, diaChi: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Cập nhật</button>
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case "tours":
        return renderToursContent();
      case "schedules":
        return renderSchedulesContent();
      case "destinations":
        return renderLocationsContent();
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Admin Panel</h1>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeMenu === "tours" ? "active" : ""}`}
            onClick={() => setActiveMenu("tours")}
          >
            Quản Lý Tour
          </button>
          <button
            className={`nav-item ${activeMenu === "schedules" ? "active" : ""}`}
            onClick={() => setActiveMenu("schedules")}
          >
            Quản Lý Lịch Trình
          </button>
          <button
            className={`nav-item ${
              activeMenu === "destinations" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("destinations")}
          >
            Quản Lý Điểm Đến
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="main-content">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;
