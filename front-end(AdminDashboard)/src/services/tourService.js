const API_URL = "https://localhost:7050/api/Admin";

export const tourService = {
  // Lấy danh sách tour
  getTours: async (
    search = "",
    sortBy = null,
    sortOrder = "asc",
    page = 1,
    pageSize = 10
  ) => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (sortBy) {
      params.append("sortBy", sortBy.toLowerCase());
      params.append("sortOrder", sortOrder.toLowerCase());
    }
    params.append("page", page);
    params.append("pageSize", pageSize);

    const response = await fetch(`${API_URL}/danh-sach-don-gian?${params}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không thể lấy danh sách tour");
    }
    return response.json();
  },

  // Thêm tour mới
  addTour: async (tourData) => {
    const response = await fetch(`${API_URL}/them`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maTour: tourData.maTour,
        tenTour: tourData.tenTour,
        soLuong: parseInt(tourData.soLuong),
        giaTour: parseInt(tourData.giaTour),
        hinhAnh: tourData.hinhAnh,
        maDiaDiem: tourData.maDiaDiem || null,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Không thể thêm tour");
    }
    return data;
  },

  // Cập nhật tour
  updateTour: async (maTour, tourData) => {
    try {
      console.log("Sending update request with data:", {
        maTour,
        tourData,
      });

      const response = await fetch(`${API_URL}/sua/${maTour}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maTour: maTour,
          tenTour: tourData.tenTour,
          soLuong: parseInt(tourData.soLuong),
          giaTour: parseInt(tourData.giaTour),
          hinhAnh: tourData.hinhAnh,
          maDiaDiem: tourData.maDiaDiem || null,
        }),
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (!response.ok) {
        const errorMessage =
          data.message || data.errors?.maTour?.[0] || "Không thể cập nhật tour";
        throw new Error(errorMessage);
      }
      return data;
    } catch (error) {
      console.error("Error updating tour:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },

  // Xóa tour
  deleteTour: async (maTour) => {
    const response = await fetch(`${API_URL}/xoa/${maTour}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Không thể xóa tour");
    }
    return data;
  },
};
