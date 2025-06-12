const API_URL = "https://localhost:7050/api/Admin";

export const scheduleService = {
  // Lấy danh sách lịch trình
  getSchedules: async (
    search = "",
    sortBy = "NgayBd",
    sortOrder = "asc",
    page = 1,
    pageSize = 10
  ) => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    params.append("sortBy", sortBy);
    params.append("isAsc", sortOrder === "asc");
    params.append("page", page);
    params.append("pageSize", pageSize);

    const response = await fetch(`${API_URL}/danhsach-lichtrinh?${params}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không thể lấy danh sách lịch trình");
    }
    return response.json();
  },

  // Thêm lịch trình mới
  addSchedule: async (scheduleData) => {
    const response = await fetch(`${API_URL}/them-lichtrinh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Không thể thêm lịch trình");
    }
    return data;
  },

  // Cập nhật lịch trình
  updateSchedule: async (maLt, scheduleData) => {
    const response = await fetch(`${API_URL}/sua-lichtrinh/${maLt}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Không thể cập nhật lịch trình");
    }
    return data;
  },

  // Xóa lịch trình
  deleteSchedule: async (maLt) => {
    const response = await fetch(`${API_URL}/xoa-lichtrinh/${maLt}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Không thể xóa lịch trình");
    }
    return data;
  },
};
