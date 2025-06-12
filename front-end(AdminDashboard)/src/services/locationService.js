const API_URL = "https://localhost:7050/api/Admin";

export const locationService = {
  // Lấy danh sách địa điểm
  getLocations: async (
    search = "",
    sortBy = "TenDiaDiem",
    isAsc = true,
    page = 1,
    pageSize = 10
  ) => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    params.append("sortBy", sortBy);
    params.append("isAsc", isAsc);
    params.append("page", page);
    params.append("pageSize", pageSize);

    const response = await fetch(`${API_URL}/danh-sach-dia-diem?${params}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không thể lấy danh sách địa điểm");
    }
    return response.json();
  },

  // Thêm địa điểm mới
  addLocation: async (locationData) => {
    const response = await fetch(`${API_URL}/them-diadiem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maDiaDiem: locationData.maDiaDiem,
        tenDiaDiem: locationData.tenDiaDiem,
        diaChi: locationData.diaChi,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Không thể thêm địa điểm");
    }
    return data;
  },

  // Cập nhật địa điểm
  updateLocation: async (maDiaDiem, locationData) => {
    const response = await fetch(`${API_URL}/cap-nhat-diadiem/${maDiaDiem}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tenDiaDiem: locationData.tenDiaDiem,
        diaChi: locationData.diaChi,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Không thể cập nhật địa điểm");
    }
    return data;
  },

  // Xóa địa điểm
  deleteLocation: async (maDiaDiem) => {
    const response = await fetch(`${API_URL}/xoa-diadiem/${maDiaDiem}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Không thể xóa địa điểm");
    }
    return data;
  },
};
