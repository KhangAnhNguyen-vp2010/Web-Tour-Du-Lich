using System;
using System.Collections.Generic;

namespace API_Web_Tour_Du_Lich.Models;

public partial class Tour
{
    public string MaTour { get; set; } = null!;

    public string? TenTour { get; set; }

    public int? SoLuong { get; set; }

    public decimal? GiaTour { get; set; }

    public string? HinhAnh { get; set; }

    public string? MaDiaDiem { get; set; }

    public virtual ICollection<CtdangKy> CtdangKies { get; set; } = new List<CtdangKy>();

    public virtual ICollection<LichTrinh> LichTrinhs { get; set; } = new List<LichTrinh>();

    public virtual DiaDiem? MaDiaDiemNavigation { get; set; }
}
