using System;
using System.Collections.Generic;

namespace API_Web_Tour_Du_Lich.Models;

public partial class PhieuDangKy
{
    public string MaPhieu { get; set; } = null!;

    public string? MaKh { get; set; }

    public DateOnly? NgayDangKy { get; set; }

    public virtual ICollection<CtdangKy> CtdangKies { get; set; } = new List<CtdangKy>();

    public virtual HoaDon? HoaDon { get; set; }

    public virtual KhachHang? MaKhNavigation { get; set; }
}
