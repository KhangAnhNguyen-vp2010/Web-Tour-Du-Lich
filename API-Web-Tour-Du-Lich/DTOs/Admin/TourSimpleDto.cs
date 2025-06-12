namespace API_Web_Tour_Du_Lich.DTOs.Admin
{
    public class TourSimpleDto
    {
        public string MaTour { get; set; } = null!;
        public string TenTour { get; set; } = null!;
        public int? SoLuong { get; set; }
        public decimal? GiaTour { get; set; }
        public string? HinhAnh { get; set; }
        public string MaDiaDiem { get; set; } = null!;
    }
}
