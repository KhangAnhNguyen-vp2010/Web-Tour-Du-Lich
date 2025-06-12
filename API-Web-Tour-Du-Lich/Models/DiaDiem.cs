using System;
using System.Collections.Generic;

namespace API_Web_Tour_Du_Lich.Models;

public partial class DiaDiem
{
    public string MaDiaDiem { get; set; } = null!;

    public string? TenDiaDiem { get; set; }

    public string? DiaChi { get; set; }

    public virtual ICollection<Tour> Tours { get; set; } = new List<Tour>();
}
