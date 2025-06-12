using System;
using System.Collections.Generic;

namespace API_Web_Tour_Du_Lich.Models;

public partial class TaiKhoan
{
    public string Tentk { get; set; } = null!;

    public string? Matkhau { get; set; }

    public virtual KhachHang? KhachHang { get; set; }
}
