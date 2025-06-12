namespace API_Web_Tour_Du_Lich.DTOs.Admin
{
    public class LichTrinhSimpleDto
    {
        public string MaLt { get; set; } = null!;
        public string? MaTour { get; set; }
        public DateOnly? NgayBd { get; set; }
        public DateOnly? NgayKt { get; set; }
        public string? MoTa { get; set; }
    }
}
