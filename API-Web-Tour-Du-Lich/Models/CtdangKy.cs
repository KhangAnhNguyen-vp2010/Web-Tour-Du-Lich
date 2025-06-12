using System;
using System.Collections.Generic;

namespace API_Web_Tour_Du_Lich.Models;

public partial class CtdangKy
{
    public string MaPhieu { get; set; } = null!;

    public string MaTour { get; set; } = null!;

    public int? SoLuongDk { get; set; }

    public string? MaLt { get; set; }

    public virtual LichTrinh? MaLtNavigation { get; set; }

    public virtual PhieuDangKy MaPhieuNavigation { get; set; } = null!;

    public virtual Tour MaTourNavigation { get; set; } = null!;
}
