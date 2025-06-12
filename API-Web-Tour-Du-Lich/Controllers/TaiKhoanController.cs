using API_Web_Tour_Du_Lich.DTOs.TaiKhoan;
using API_Web_Tour_Du_Lich.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API_Web_Tour_Du_Lich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiKhoanController : ControllerBase
    {
        private readonly TourDuLichContext _context;

        public TaiKhoanController(TourDuLichContext context)
        {
            _context = context;
        }

        [HttpPut("changepassword")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.UserName) ||
                string.IsNullOrEmpty(dto.CurrentPassword) || string.IsNullOrEmpty(dto.NewPassword))
            {
                return BadRequest("Dữ liệu không hợp lệ.");
            }

            var taiKhoan = await _context.TaiKhoans.FindAsync(dto.UserName);
            if (taiKhoan == null)
            {
                return NotFound("Tài khoản không tồn tại.");
            }

            // Kiểm tra mật khẩu cũ (lưu ý: nếu có mã hóa thì xử lý giải mã hoặc so sánh phù hợp)
            if (taiKhoan.Matkhau != dto.CurrentPassword)
            {
                return BadRequest("Mật khẩu hiện tại không đúng.");
            }

            // Cập nhật mật khẩu mới
            taiKhoan.Matkhau = dto.NewPassword;

            try
            {
                await _context.SaveChangesAsync();
                return Ok("Đổi mật khẩu thành công.");
            }
            catch (Exception ex)
            {
                // Có thể log lỗi nếu cần
                return StatusCode(500, "Lỗi khi cập nhật mật khẩu.");
            }
        }
    }
}
