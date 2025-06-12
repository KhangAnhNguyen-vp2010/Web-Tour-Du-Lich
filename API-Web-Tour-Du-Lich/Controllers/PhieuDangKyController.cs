using API_Web_Tour_Du_Lich.DTOs.PhieuDangKy;
using API_Web_Tour_Du_Lich.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_Web_Tour_Du_Lich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhieuDangKyController : ControllerBase
    {
        private readonly TourDuLichContext _context;

        public PhieuDangKyController(TourDuLichContext context)
        {
            _context = context;
        }

        // POST: api/PhieuDangKy
        [HttpPost]
        public async Task<IActionResult> TaoPhieuDangKy([FromBody] TaoPhieuDangKyDto request)
        {
            if (string.IsNullOrEmpty(request.MaKh) || request.ChiTietTours.Count == 0)
            {
                return BadRequest("Thiếu thông tin khách hàng hoặc danh sách tour.");
            }

            // Tạo mã phiếu mới
            var maPhieu = "PDK" + DateTime.UtcNow.Ticks;

            var phieu = new PhieuDangKy
            {
                MaPhieu = maPhieu,
                MaKh = request.MaKh,
                NgayDangKy = DateOnly.FromDateTime(DateTime.Now),
            };

            _context.PhieuDangKies.Add(phieu);

            // Tạo chi tiết đăng ký
            foreach (var ct in request.ChiTietTours)
            {
                var tour = await _context.Tours
            .Include(t => t.CtdangKies)
            .FirstOrDefaultAsync(t => t.MaTour == ct.MaTour);

                int daDangKy = tour.CtdangKies.Sum(dk => dk.SoLuongDk ?? 0);
                int soConLai = (tour.SoLuong ?? 0);

                if (ct.SoLuongDk > soConLai)
                {
                    return BadRequest($"Tour {ct.MaTour} chỉ còn {soConLai} chỗ trống. Bạn đã đăng ký {ct.SoLuongDk}.");
                }

                if (tour == null)
                    return NotFound($"Không tìm thấy tour với mã: {ct.MaTour}");

                var ctDk = new CtdangKy
                {
                    MaPhieu = maPhieu,
                    MaTour = ct.MaTour,
                    SoLuongDk = ct.SoLuongDk,
                    MaLt = ct.MaLT,
                };
                _context.CtdangKies.Add(ctDk);

                tour.SoLuong -= ct.SoLuongDk;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công", maPhieu });
        }

        

        [HttpGet("Chi-Tiet/{maPhieu}")]
        public async Task<IActionResult> GetPhieuDangKyDetail(string maPhieu)
        {
            var phieu = await _context.PhieuDangKies
                .Include(p => p.CtdangKies)
                    .ThenInclude(ct => ct.MaLtNavigation)
                    .ThenInclude(ct => ct.MaTourNavigation)
                .Include(p => p.MaKhNavigation)
                .FirstOrDefaultAsync(p => p.MaPhieu == maPhieu);

            if (phieu == null)
            {
                return NotFound("Không tìm thấy phiếu đăng ký.");
            }

            var result = new
            {
                MaPhieu = phieu.MaPhieu,
                MaKhachHang = phieu.MaKh,
                TenKhachHang = phieu.MaKhNavigation?.TenKh,
                NgayDangKy = phieu.NgayDangKy,
                ChiTiet = phieu.CtdangKies.Select(ct => new
                {
                    MaTour = ct.MaTour,
                    TenTour = ct.MaTourNavigation?.TenTour,
                    SoLuongDangKy = ct.SoLuongDk,
                    NgayBD = ct.MaLtNavigation?.NgayBd,
                    NgayKT = ct.MaLtNavigation?.NgayKt,
                }).ToList()
            };

            return Ok(result);
        }

        [HttpPut("Huy/{maPhieu}")]
        public async Task<IActionResult> HuyPhieuDangKy(string maPhieu)
        {
            // Find the registration form and include its details
            var phieu = await _context.PhieuDangKies
                .Include(p => p.CtdangKies)
                    .ThenInclude(ct => ct.MaLtNavigation)
                    .ThenInclude(ct => ct.MaTourNavigation)
                .FirstOrDefaultAsync(p => p.MaPhieu == maPhieu);

            if (phieu == null)
            {
                return NotFound("Không tìm thấy phiếu đăng ký.");
            }

            // Restore available slots to each tour
            foreach (var ct in phieu.CtdangKies)
            {
                var tour = await _context.Tours
                    .FirstOrDefaultAsync(t => t.MaTour == ct.MaTour);

                if (tour == null)
                {
                    return NotFound($"Không tìm thấy tour với mã: {ct.MaTour}");
                }

                if (ct.MaLtNavigation == null)
                {
                    return BadRequest($"Không tìm thấy lịch trình cho mã lịch trình: {ct.MaLt}");
                }

                // Assuming NgayBd is DateOnly; adjust if it's DateTime
                var ngayBd = ct.MaLtNavigation.NgayBd.Value; // Lấy từ LichTrinh
                var earliestCancelDate = ngayBd.AddDays(-3);
                var today = DateOnly.FromDateTime(DateTime.Now); // Đảm bảo today là DateOnly
                if (today >= earliestCancelDate)
                {
                    return BadRequest($"Không thể hủy phiếu đăng ký vì tour {ct.MaTour} sẽ bắt đầu vào {ct.MaLtNavigation.NgayBd.Value:dd/MM/yyyy}, trong khi hôm nay là {today:dd/MM/yyyy}. Hủy phải được thực hiện trước 3 ngày.");
                }

                // Add back the registered quantity to the tour's available slots
                tour.SoLuong += ct.SoLuongDk;
            }

            // Save changes to the database
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hủy phiếu đăng ký thành công", maPhieu });
        }

        [HttpPut("TuDongHuy/{maPhieu}")]
        public async Task<IActionResult> TuDongHuyPhieuDangKy(string maPhieu)
        {
            // Find the registration form and include its details
            var phieu = await _context.PhieuDangKies
                .Include(p => p.CtdangKies)
                    .ThenInclude(ct => ct.MaLtNavigation)
                    .ThenInclude(ct => ct.MaTourNavigation)
                .FirstOrDefaultAsync(p => p.MaPhieu == maPhieu);

            if (phieu == null)
            {
                return NotFound("Không tìm thấy phiếu đăng ký.");
            }

            // Restore available slots to each tour
            foreach (var ct in phieu.CtdangKies)
            {
                var tour = await _context.Tours
                    .FirstOrDefaultAsync(t => t.MaTour == ct.MaTour);

                if (tour == null)
                {
                    return NotFound($"Không tìm thấy tour với mã: {ct.MaTour}");
                }

                if (ct.MaLtNavigation == null)
                {
                    return BadRequest($"Không tìm thấy lịch trình cho mã lịch trình: {ct.MaLt}");
                }

                // Add back the registered quantity to the tour's available slots
                tour.SoLuong += ct.SoLuongDk;
            }

            // Save changes to the database
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hủy phiếu đăng ký thành công", maPhieu });
        }

    }
}