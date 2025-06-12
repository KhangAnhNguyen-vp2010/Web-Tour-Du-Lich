using API_Web_Tour_Du_Lich.DTOs.CtDangKy;

namespace API_Web_Tour_Du_Lich.DTOs.PhieuDangKy
{
    public class TaoPhieuDangKyDto
    {
        public string MaKh { get; set; } = null!;
        public List<ChiTietDangKyDto> ChiTietTours { get; set; } = new();
    }
}
