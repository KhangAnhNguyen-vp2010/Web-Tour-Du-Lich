using System;
using System.Collections.Generic;

namespace API_Web_Tour_Du_Lich.Models;

public partial class LichTrinh
{
    public string MaLt { get; set; } = null!;

    public string? MaTour { get; set; }

    public DateOnly? NgayBd { get; set; }

    public DateOnly? NgayKt { get; set; }

    public string? MoTa { get; set; }

    public virtual ICollection<CtdangKy> CtdangKies { get; set; } = new List<CtdangKy>();

    public virtual Tour? MaTourNavigation { get; set; }
}
