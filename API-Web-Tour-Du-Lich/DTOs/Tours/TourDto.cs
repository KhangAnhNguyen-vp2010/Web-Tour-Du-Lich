using API_Web_Tour_Du_Lich.DTOs.DiaDiem;
using API_Web_Tour_Du_Lich.DTOs.LichTrinh;

namespace API_Web_Tour_Du_Lich.DTOs.Tours
{
    public class TourDto
    {
        public string? MaTour { get; set; }
        public string? TenTour { get; set; }
        public int? SoLuong { get; set; }
        public decimal? GiaTour { get; set; }
        public string? HinhAnh { get; set; }
        public DiaDiemDto? DiaDiem { get; set; }
    }
}
