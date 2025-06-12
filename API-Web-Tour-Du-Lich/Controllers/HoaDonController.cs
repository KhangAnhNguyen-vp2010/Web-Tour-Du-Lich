using API_Web_Tour_Du_Lich.DTOs.HoaDon;
using API_Web_Tour_Du_Lich.DTOs.PhieuDangKy;
using API_Web_Tour_Du_Lich.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_Web_Tour_Du_Lich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoaDonController : ControllerBase
    {
        private readonly TourDuLichContext _context;

        public HoaDonController(TourDuLichContext context)
        {
            _context = context;
        }

        [HttpPost("lap-hoa-don")]
        public async Task<IActionResult> LapHoaDon([FromBody] TaoHoaDonDto request)
        {
            var phieu = await _context.PhieuDangKies
                .Include(p => p.CtdangKies)
                .FirstOrDefaultAsync(p => p.MaPhieu == request.MaPhieu);

            if (phieu == null)
                return NotFound("Phiếu đăng ký không tồn tại.");

            // Kiểm tra nếu đã có hóa đơn rồi
            var existingHoaDon = await _context.HoaDons
                .FirstOrDefaultAsync(h => h.MaPhieu == request.MaPhieu);

            if (existingHoaDon != null)
                return BadRequest("Phiếu này đã có hóa đơn.");

            decimal tongTien = 0;

            foreach (var ct in phieu.CtdangKies)
            {
                var tour = await _context.Tours
                    .FirstOrDefaultAsync(t => t.MaTour == ct.MaTour);

                if (tour == null)
                    return NotFound($"Không tìm thấy tour với mã: {ct.MaTour}");

                decimal gia = tour.GiaTour ?? 0;
                tongTien += gia * (ct.SoLuongDk ?? 0);
            }

            // Tạo mã hóa đơn
            string maHd = $"HD{Guid.NewGuid().ToString("N")[..8]}";

            var hoaDon = new HoaDon
            {
                MaHd = maHd,
                MaPhieu = request.MaPhieu,
                NgayLap = DateTime.Now,
                TongTien = tongTien,
                TrangThai = "Chưa thanh toán"
            };

            _context.HoaDons.Add(hoaDon);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Lập hóa đơn thành công", MaHoaDon = maHd, TongTien = tongTien });
        }

        [HttpGet("khachhang/{maKh}")]
        public async Task<IActionResult> GetHoaDonsByKhachHang(string maKh)
        {
            var hoaDons = await _context.HoaDons
                .Include(hd => hd.MaPhieuNavigation)
                .ThenInclude(p => p.MaKhNavigation)
                .Where(hd => hd.MaPhieuNavigation != null && hd.MaPhieuNavigation.MaKh == maKh)
                .Select(hd => new
                {
                    MaHd = hd.MaHd,
                    NgayLap = hd.NgayLap,
                    TongTien = hd.TongTien,
                    TrangThai = hd.TrangThai,
                    MaPhieu = hd.MaPhieu
                })
                .ToListAsync();

            if (hoaDons == null || !hoaDons.Any())
                return NotFound("Không tìm thấy hóa đơn nào cho khách hàng này.");

            return Ok(hoaDons);
        }

        [HttpPut("capnhat-trangthai/{maHd}")]
        public async Task<IActionResult> CapNhatTrangThaiHoaDon(string maHd, [FromBody] UpdateTrangThaiDto request)
        {
            var hoaDon = await _context.HoaDons.FindAsync(maHd);
            if (hoaDon == null)
            {
                return NotFound("Không tìm thấy hóa đơn.");
            }

            hoaDon.TrangThai = request.TrangThai;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công." });
        }

        [HttpGet("hoadon-dathanhtoan/{maKh}")]
        public async Task<IActionResult> LayHoaDonDaThanhToan(string maKh)
        {
            var hoaDons = await _context.HoaDons
                .Where(hd => hd.MaPhieuNavigation != null
                             && hd.MaPhieuNavigation.MaKh == maKh
                             && hd.TrangThai == "Đã thanh toán")
                .Select(hd => new
                {
                    hd.MaHd,
                    hd.NgayLap,
                    hd.TongTien,
                    hd.TrangThai,
                    // Lấy chi tiết tour từ phiếu đăng ký -> chi tiết đăng ký
                    ChiTietTours = hd.MaPhieuNavigation.CtdangKies.Select(ct => new
                    {
                        MaTour = ct.MaTour,
                        TenTour = ct.MaTourNavigation.TenTour,
                        NgayBd = ct.MaLtNavigation.NgayBd,
                        NgayKt = ct.MaLtNavigation.NgayKt,
                        SoLuongDangKy = ct.SoLuongDk
                    })
                })
                .ToListAsync();

            return Ok(hoaDons);
        }
    }
}
