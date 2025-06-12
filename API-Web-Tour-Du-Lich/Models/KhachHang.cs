using System;
using System.Collections.Generic;

namespace API_Web_Tour_Du_Lich.Models;

public partial class KhachHang
{
    public string MaKh { get; set; } = null!;

    public string? TenKh { get; set; }

    public string? Email { get; set; }

    public string? Sdt { get; set; }

    public string? DiaChi { get; set; }

    public string? Tentk { get; set; }

    public virtual ICollection<PhieuDangKy> PhieuDangKies { get; set; } = new List<PhieuDangKy>();

    public virtual TaiKhoan? TentkNavigation { get; set; }
}
