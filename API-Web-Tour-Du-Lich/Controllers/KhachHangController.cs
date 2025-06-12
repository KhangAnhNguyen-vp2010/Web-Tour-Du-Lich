using API_Web_Tour_Du_Lich.DTOs.KhachHang;
using API_Web_Tour_Du_Lich.Models;
using API_Web_Tour_Du_Lich.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace API_Web_Tour_Du_Lich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhachHangController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly TourDuLichContext _context;

        public KhachHangController(IConfiguration configuration, TourDuLichContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("add-customer")]
        public IActionResult AddCustomer([FromBody] AddKH request)
        {
            int result = -99;

            using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                using (var command = new SqlCommand("ThemKhachHangTuDongMaKH", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@TenKH", request.TenKH);
                    command.Parameters.AddWithValue("@Email", request.Email);
                    command.Parameters.AddWithValue("@SDT", request.SDT);
                    command.Parameters.AddWithValue("@DiaChi", request.DiaChi);
                    command.Parameters.AddWithValue("@TenTaiKhoan", request.TenTaiKhoan);

                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            result = reader.GetInt32(0); // Kết quả trả về từ proc
                        }
                    }
                }
            }

            // Xử lý kết quả
            switch (result)
            {
                case 1:
                    return Ok(new { message = "Thêm khách hàng thành công." });
                case 0:
                    return BadRequest(new { message = "Tài khoản đã được gán cho một khách hàng khác." });
                case -1:
                    return BadRequest(new { message = "Tài khoản không tồn tại." });
                default:
                    return StatusCode(500, new { message = "Lỗi không xác định." });
            }
        }

        // GET api/khachhang/{tentk}
        [HttpGet("{tentk}")]
        public async Task<ActionResult<KhachHangDto>> GetKhachHang(string tentk)
        {
            var khachHang = await _context.KhachHangs
                .Where(k => k.Tentk == tentk)
                .Select(k => new KhachHangDto
                {
                    MaKh = k.MaKh,
                    TenKh = k.TenKh,
                    DiaChi = k.DiaChi,
                    Email = k.Email,
                    Sdt = k.Sdt,
                    Tentk = k.Tentk
                })
                .FirstOrDefaultAsync();

            if (khachHang == null)
            {
                return NotFound();
            }

            return Ok(khachHang);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateKhachHang(string id, KhachHangDto khachHangDto)
        {
            if (id != khachHangDto.MaKh)
            {
                return BadRequest("Mã khách hàng không khớp.");
            }

            var khachHang = await _context.KhachHangs.FindAsync(id);
            if (khachHang == null)
            {
                return NotFound();
            }

            khachHang.TenKh = khachHangDto.TenKh;
            khachHang.DiaChi = khachHangDto.DiaChi;
            khachHang.Email = khachHangDto.Email;
            khachHang.Sdt = khachHangDto.Sdt;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.KhachHangs.Any(e => e.MaKh == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

    }
}
