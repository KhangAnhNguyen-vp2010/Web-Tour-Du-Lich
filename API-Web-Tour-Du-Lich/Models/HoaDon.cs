using System;
using System.Collections.Generic;

namespace API_Web_Tour_Du_Lich.Models;

public partial class HoaDon
{
    public string MaHd { get; set; } = null!;

    public string? MaPhieu { get; set; }

    public DateTime? NgayLap { get; set; }

    public decimal? TongTien { get; set; }

    public string? TrangThai { get; set; }

    public virtual PhieuDangKy? MaPhieuNavigation { get; set; }
}
